"use client";

import { cn } from "@/shared/utils/index";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildMechBust } from "./mech-bust";

interface Props {
  className?: string;
  /** `thinking` — модель обробляє запит: діоди пульсують частіше, бюст дихає. */
  state?: "idle" | "thinking";
  /**
   * Стежити за курсором по всій сторінці, а не лише над канвасом.
   * Канвас у чаті перекритий повідомленнями й має pointer-events: none,
   * тому подію слухаємо на вікні — інакше робот був би сліпим.
   */
  trackWindow?: boolean;
}

/** Кути стеження: голова ±20° по горизонталі, ±10° по вертикалі. */
const YAW_MAX = 0.35;
const PITCH_MAX = 0.17;

/** Скільки мовчати, перш ніж робот почне озиратися сам. */
const IDLE_AFTER_MS = 3500;

/**
 * Мех-спостерігач AI-помічника — 3D-бюст, який стежить за курсором.
 *
 * Свій рендерер, а не iframe із public/robot/robot-bust-standalone.html:
 * той бандл тягне three.js з unpkg (усередині мережі компанії CDN недоступний),
 * малює свій фон і власний UI, а курсор бачив би лише в межах фрейма — довелося б
 * ще й міст на postMessage. Тут же прозорий канвас лягає в темну сцену чату,
 * а `pointermove` слухається на вікні.
 *
 * Сцена жодного разу не перебудовується на ре-рендер React: стан приходить через
 * ref, а весь three.js живе в одному useEffect із повним прибиранням за собою —
 * WebGL-контекст дорогий, а на сторінці вже є другий (ParticleWave).
 */
export function AiRobot({
  className = "",
  state = "idle",
  trackWindow = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  /**
   * Перший кадр уже намальовано.
   *
   * До нього канвас порожній, і при поверненні на сторінку (чи будь-якому
   * перемонтуванні) робот «блимав» — спершу порожнеча, потім різка поява.
   * Тому показуємо його лише після першого рендера, і то плавно.
   */
  const [ready, setReady] = useState(false);

  // Стан у ref, а не в залежностях ефекту: інакше кожен «думає/не думає»
  // перебудовував би всю сцену
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);

    // Корпус бюста — металевий і темний. Без карти оточення металу нічого
    // відбивати, і на темному фоні чату він читався б чорною плямою, тому
    // сцені дається процедурна «кімната» — вона ж дає м'які відблиски на гранях.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    // На повній силі «кімната» висвітлює корпус до сріблястого й глушить діоди —
    // тримаємо її як джерело відблисків, а не як основне освітлення
    scene.environmentIntensity = 0.5;
    pmrem.dispose();

    // Далі — студія під темно-фіолетову сцену чату: холодний ключ спереду-згори,
    // фіолетовий підбій і контурне світло кольору інтерфейсу, щоб силует
    // відділявся від фону, а не зливався з ним
    scene.add(new THREE.HemisphereLight(0xdcd9ff, 0x241542, 0.9));

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2.2, 3.4, 4.5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xc4b5fd, 0.8);
    fill.position.set(-4, 1.2, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xe879f9, 1.8);
    rim.position.set(-2.5, 2.2, -3.5);
    scene.add(rim);

    const bust = buildMechBust();
    scene.add(bust.robot);

    // Кадрування: у вихідній сцені камера стояла в три чверті й брала фігуру
    // цілком. У чаті це аватар — тому майже фронтально, на рівні грудей і
    // щільніше: постамент можна різати, обличчя й наплічники — ні.
    const box = new THREE.Box3().setFromObject(bust.robot);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const focus = sphere.center.clone().setY(sphere.center.y + 0.24);
    const dist = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 0.92;
    camera.position
      .copy(focus)
      .add(new THREE.Vector3(0.18, 0.16, 1).normalize().multiplyScalar(dist));
    camera.lookAt(focus);

    const baseY = bust.robot.position.y;

    const fit = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);

    // ── стеження за курсором ──────────────────────────────────────────
    const target = { yaw: 0, pitch: 0 };
    let lastMove = performance.now();

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.yaw = nx * YAW_MAX;
      target.pitch = ny * PITCH_MAX;
      lastMove = performance.now();
    };

    const moveTarget: Window | HTMLElement = trackWindow ? window : container;
    moveTarget.addEventListener("pointermove", onPointerMove as EventListener);

    // ── цикл ──────────────────────────────────────────────────────────
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let prev = performance.now();
    let shown = false;

    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const thinking = stateRef.current === "thinking";

      // Довго без руху миші — робот озирається сам, щоб не «вмирав» на екрані
      const idle = now - lastMove > IDLE_AFTER_MS;
      const yaw = idle ? Math.sin(now / 1600) * YAW_MAX * 0.7 : target.yaw;
      const pitch = idle ? Math.sin(now / 2300) * PITCH_MAX * 0.5 : target.pitch;

      const k = 1 - Math.pow(0.002, dt); // запізніле, механічне згладжування
      bust.head.rotation.y = lerp(bust.head.rotation.y, yaw, k);
      bust.head.rotation.x = lerp(bust.head.rotation.x, pitch, k);
      bust.torso.rotation.y = lerp(bust.torso.rotation.y, yaw * 0.4, k * 0.6);
      bust.torso.rotation.x = lerp(bust.torso.rotation.x, pitch * 0.15, k * 0.6);

      for (const e of bust.eyes.children) {
        const home = e.userData.home as THREE.Vector3 | undefined;
        if (!home) continue;
        e.position.x = home.x + yaw * 0.008;
        e.position.y = home.y - pitch * 0.01;
      }

      // Поки модель думає — діоди частішають, а бюст ледь помітно «дихає»
      const pulse = thinking ? 2.4 : 1;
      const M = bust.materials;
      M.cyan.emissiveIntensity =
        (thinking ? 2.1 : 1.6) +
        Math.sin((now / 260) * pulse) * 0.35 +
        Math.sin((now / 71) * pulse) * 0.12;
      M.white.emissiveIntensity =
        (thinking ? 2.5 : 1.9) + Math.sin((now / 340) * pulse) * 0.25;
      M.amber.emissiveIntensity =
        1.3 + Math.sin((now / 470) * pulse) * (thinking ? 0.45 : 0.2);

      bust.robot.position.y =
        baseY + (thinking ? Math.sin(now / 520) * 0.012 : 0);

      renderer.render(scene, camera);

      // Проявляємо канвас лише коли на ньому вже щось намальовано
      if (!shown) {
        shown = true;
        setReady(true);
      }
    };

    renderer.setAnimationLoop(frame);

    // Невидимий канвас не має крутити GPU: на сторінці вже є друга WebGL-сцена
    const setRunning = (on: boolean) =>
      renderer.setAnimationLoop(on ? frame : null);

    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    return () => {
      renderer.setAnimationLoop(null);
      moveTarget.removeEventListener(
        "pointermove",
        onPointerMove as EventListener,
      );
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      scene.remove(bust.robot);
      bust.dispose();
      envRT.dispose();
      renderer.domElement.remove();
      // Без forceContextLoss браузер тримає контекст, а їх у вкладці ~16
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [trackWindow]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "transition-opacity duration-500 ease-out",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}

export default AiRobot;
