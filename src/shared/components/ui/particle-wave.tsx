"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface ParticleWaveProps {
  className?: string;
  /** Кількість точок по кожній осі сітки (amount × amount). Менше — легше для GPU. */
  amount?: number;
  /** Прозорий фон: під канвасом видно фон застосунку. Для фонового шару — true. */
  transparent?: boolean;
  /** Прозорість самих точок. */
  opacity?: number;
  /** Сила хвилі під курсором. 0 — курсор не впливає. */
  mouseStrength?: number;
  /** Колір точок у форматі 0..1. За замовчуванням береться з теми (світла/темна). */
  color?: [number, number, number];
}

/**
 * Хвиля з частинок на three.js — фоновий шар.
 *
 * Відмінності від «канонічного» сніпета, які потрібні саме тут:
 *  - розмір береться з батьківського контейнера (ResizeObserver), а не з вікна,
 *    тож компонент можна класти в будь-який блок, а не лише на весь екран;
 *  - `transparent` дає фон застосунку просвічувати — інакше канвас затирає тему;
 *    - курсор реально впливає на сітку (у оригіналі позиція рахувалась, але не
 *    використовувалась): промінь із камери проєктується на площину y = 0, і
 *    навколо цієї точки шейдер піднімає м'яку хвилю;
 *  - тема читається через MutationObserver, а не в кожному кадрі.
 */
const ParticleWave: React.FC<ParticleWaveProps> = ({
  className = "",
  amount = 200,
  transparent = false,
  opacity = 0.5,
  mouseStrength = 1,
  color,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Пропси в ref, щоб ефект нижче лишався з порожнім списком залежностей
  // і сцена не перестворювалась на кожен ререндер батька.
  const propsRef = useRef({ amount, transparent, opacity, mouseStrength, color });
  propsRef.current = { amount, transparent, opacity, mouseStrength, color };

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    particleMaterial: THREE.ShaderMaterial;
    animationId: number | null;
    /** Ціль курсора у координатах сцени (площина y = 0). */
    mouseTarget: THREE.Vector2;
    raycaster: THREE.Raycaster;
    plane: THREE.Plane;
    pointer: THREE.Vector2;
  } | null>(null);

  const getCurrentTheme = () =>
    document.documentElement.classList.contains("dark") ? "dark" : "light";

  const getBackgroundColor = (theme: string) =>
    theme === "dark" ? new THREE.Color(0x000000) : new THREE.Color(0xffffff);

  const getParticleColor = (theme: string) => {
    const override = propsRef.current.color;
    if (override) return new THREE.Vector3(...override);

    return theme === "dark"
      ? new THREE.Vector3(1.0, 1.0, 1.0)
      : new THREE.Vector3(0.0, 0.0, 0.0);
  };

  const particleVertex = `
    attribute float scale;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseStrength;

    void main() {
      vec3 p = position;
      float s = scale;

      p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
      p.x += (sin(p.y + uTime) * 0.5);
      s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;

      // М'яка хвиля навколо курсора: гаусів спад, щоб краї не «різались»
      float d = distance(p.xz, uMouse);
      float ripple = exp(-d * d * 0.015) * uMouseStrength;
      p.y += sin(d * 1.2 - uTime * 2.0) * ripple * 1.5;
      s += ripple;

      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = s * 15.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const particleFragment = `
    uniform vec3 uColor;
    uniform float uOpacity;

    void main() {
      // Кругла точка з м'яким краєм замість квадрата
      vec2 uv = gl_PointCoord - vec2(0.5);
      float alpha = smoothstep(0.5, 0.15, length(uv));
      if (alpha < 0.01) discard;

      gl_FragColor = vec4(uColor, uOpacity * alpha);
    }
  `;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { amount: amountX, transparent: isTransparent, opacity: pointOpacity } =
      propsRef.current;
    const amountY = amountX;

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      return {
        width: rect.width || window.innerWidth,
        height: rect.height || window.innerHeight,
      };
    };

    const { width, height } = size();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
    camera.position.set(0, 6, 5);

    const scene = new THREE.Scene();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: isTransparent,
      });
    } catch {
      // Без WebGL просто лишаємо порожній канвас — сторінка має працювати й так
      return;
    }

    // Ретина ×3 дає втричі більше пікселів без помітного виграшу — обмежуємо
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    const currentTheme = getCurrentTheme();
    if (isTransparent) {
      renderer.setClearColor(0x000000, 0);
    } else {
      renderer.setClearColor(getBackgroundColor(currentTheme));
    }

    const gap = 0.3;
    const particleNum = amountX * amountY;
    const particlePositions = new Float32Array(particleNum * 3);
    const particleScales = new Float32Array(particleNum);

    let i = 0;
    let j = 0;
    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        particlePositions[i] = ix * gap - (amountX * gap) / 2;
        particlePositions[i + 1] = 0;
        particlePositions[i + 2] = iy * gap - (amountX * gap) / 2;
        particleScales[j] = 1;
        i += 3;
        j++;
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    particleGeometry.setAttribute(
      "scale",
      new THREE.BufferAttribute(particleScales, 1),
    );

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: getParticleColor(currentTheme) },
        uOpacity: { value: pointOpacity },
        uMouse: { value: new THREE.Vector2(9999, 9999) },
        uMouseStrength: { value: 0 },
      },
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      particleMaterial,
      animationId: null,
      mouseTarget: new THREE.Vector2(9999, 9999),
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      pointer: new THREE.Vector2(-10, -10),
    };

    // Тема
    const applyTheme = () => {
      const theme = getCurrentTheme();
      particleMaterial.uniforms.uColor.value = getParticleColor(theme);
      if (!isTransparent) renderer.setClearColor(getBackgroundColor(theme));
    };

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Анімація
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeStep = reduceMotion ? 0.008 : 0.05;

    const animate = () => {
      const ctx = sceneRef.current;
      if (!ctx) return;

      particleMaterial.uniforms.uTime.value += timeStep;

      // Курсор доганяємо плавно — різкі стрибки виглядають дешево
      const uMouse = particleMaterial.uniforms.uMouse.value as THREE.Vector2;
      uMouse.lerp(ctx.mouseTarget, 0.08);

      const strength = particleMaterial.uniforms.uMouseStrength;
      const wanted = ctx.mouseTarget.x > 9000 ? 0 : propsRef.current.mouseStrength;
      strength.value += (wanted - strength.value) * 0.06;

      particleMaterial.uniforms.uOpacity.value = propsRef.current.opacity;

      camera.lookAt(scene.position);
      renderer.render(scene, camera);

      ctx.animationId = requestAnimationFrame(animate);
    };

    animate();

    // Розмір — від контейнера, а не від вікна
    const resize = () => {
      const { width: w, height: h } = size();
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const ctx = sceneRef.current;
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      ctx.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ctx.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Промінь із камери на площину сітки — так курсор екрана стає точкою сцени
      ctx.raycaster.setFromCamera(ctx.pointer, camera);
      const hit = new THREE.Vector3();
      if (ctx.raycaster.ray.intersectPlane(ctx.plane, hit)) {
        ctx.mouseTarget.set(hit.x, hit.z);
      }
    };

    const handleMouseLeave = () => {
      sceneRef.current?.mouseTarget.set(9999, 9999);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      const ctx = sceneRef.current;
      if (ctx?.animationId) cancelAnimationFrame(ctx.animationId);

      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);

      scene.remove(particles);
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      sceneRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />;
};

export { ParticleWave };
