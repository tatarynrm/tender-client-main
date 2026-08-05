import * as THREE from "three";

/**
 * Мех-бюст — 3D-модель AI-помічника, зібрана процедурно з примітивів three.js.
 *
 * Перенесено з public/robot/robot-bust-standalone.html: той файл — самороз­пакувальний
 * бандл, який тягне three.js з unpkg.com. Всередині мережі компанії зовнішній CDN
 * недоступний, а три.js у проєкті вже стоїть, тому геометрію перенесено в код,
 * а сцену зібрано своїм рендерером (AiRobot.tsx).
 *
 * Процедурна збірка обрана замість watcher-robot.obj навмисно: OBJ — це одна німа
 * сітка без матеріалів, а тут лишаються групи `head`, `torso`, `eyes` і живі
 * emissive-матеріали, без яких немає ні стеження за курсором, ні світіння діодів.
 */

export interface MechBustMaterials {
  gloss: THREE.MeshStandardMaterial;
  armor: THREE.MeshStandardMaterial;
  carbon: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  cyan: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
  amber: THREE.MeshStandardMaterial;
  visor: THREE.MeshStandardMaterial;
}

export interface MechBust {
  robot: THREE.Group;
  /** Корпус — довертається за головою на 40%. */
  torso: THREE.Group;
  /** Голова — стежить за курсором. */
  head: THREE.Group;
  /** Смужки-«очі»: мікрозсув у бік курсора. */
  eyes: THREE.Group;
  materials: MechBustMaterials;
  /** Звільнити пам'ять GPU: геометрії й матеріали живуть поза життєвим циклом React. */
  dispose: () => void;
}

export function buildMechBust(): MechBust {
  // Палітра: глянцеві панцирі поверх матового карбону, бірюзові й бурштинові діоди
  const M: MechBustMaterials = {
    gloss: new THREE.MeshStandardMaterial({
      name: "gloss_shell",
      color: 0x23252c,
      roughness: 0.14,
      metalness: 0.5,
    }),
    armor: new THREE.MeshStandardMaterial({
      name: "armor_matte",
      color: 0x2c2f36,
      roughness: 0.42,
      metalness: 0.3,
    }),
    carbon: new THREE.MeshStandardMaterial({
      name: "carbon_weave",
      color: 0x191b20,
      roughness: 0.68,
      metalness: 0.2,
    }),
    trim: new THREE.MeshStandardMaterial({
      name: "trim_steel",
      color: 0x4d515b,
      roughness: 0.35,
      metalness: 0.45,
    }),
    cyan: new THREE.MeshStandardMaterial({
      name: "led_cyan",
      color: 0x8fd8ff,
      emissive: 0x4fc0ff,
      emissiveIntensity: 1.8,
      roughness: 0.25,
    }),
    white: new THREE.MeshStandardMaterial({
      name: "led_white",
      color: 0xeaf6ff,
      emissive: 0xcfeaff,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    }),
    amber: new THREE.MeshStandardMaterial({
      name: "led_amber",
      color: 0xffb066,
      emissive: 0xff8c2e,
      emissiveIntensity: 1.4,
      roughness: 0.3,
    }),
    visor: new THREE.MeshStandardMaterial({
      name: "visor_glass",
      color: 0x0b0c0f,
      roughness: 0.06,
      metalness: 0.55,
    }),
  };

  const mesh = (
    name: string,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    return m;
  };

  const strip = (name: string, w: number, h: number, mat: THREE.Material) =>
    mesh(name, new THREE.BoxGeometry(w, h, 0.009), mat);

  const robot = new THREE.Group();
  robot.name = "mech_bust";

  // ---- зріз по поясу: постамент бюста ----
  const cut = mesh(
    "waist_cut",
    new THREE.CylinderGeometry(0.24, 0.28, 0.07, 8),
    M.carbon,
  );
  cut.position.y = 0.035;
  robot.add(cut);

  const cutGlow = mesh(
    "waist_glow",
    new THREE.TorusGeometry(0.255, 0.005, 10, 8),
    M.cyan,
  );
  cutGlow.rotation.x = Math.PI / 2;
  cutGlow.rotation.z = Math.PI / 8;
  cutGlow.position.y = 0.072;
  robot.add(cutGlow);

  // ---- корпус (нахиляється слідом за головою) ----
  const torso = new THREE.Group();
  torso.name = "torso";
  torso.position.y = 0.07;
  robot.add(torso);

  // сегментований живіт: стос кутастих плит із бірюзовими чипами по швах
  for (let i = 0; i < 5; i++) {
    const w = 0.3 + i * 0.022;
    const d = 0.19 + i * 0.012;
    const y = 0.05 + i * 0.062;

    const seg = mesh(
      `ab_seg_${i}`,
      new THREE.CylinderGeometry(w * 0.52, w * 0.46, 0.055, 8),
      i % 2 ? M.armor : M.carbon,
    );
    seg.position.y = y;
    seg.rotation.y = Math.PI / 8;
    torso.add(seg);

    for (const s of [-1, 1]) {
      const chip = strip(`ab_led_${i}_${s < 0 ? "l" : "r"}`, 0.034, 0.011, M.cyan);
      chip.position.set((w * 0.5 - 0.06) * s, y + 0.02, d * 0.5 + 0.02);
      chip.rotation.z = -0.45 * s;
      torso.add(chip);
    }
  }

  // бурштинові стрілки на нижніх грудях
  for (const s of [-1, 1]) {
    const tri = mesh(
      `amber_mark_${s < 0 ? "l" : "r"}`,
      new THREE.ConeGeometry(0.014, 0.026, 3),
      M.amber,
    );
    tri.position.set(0.1 * s, 0.36, 0.15);
    tri.rotation.x = Math.PI / 2;
    tri.rotation.z = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    torso.add(tri);
  }

  // грудний блок
  const chest = mesh(
    "chest_core",
    new THREE.CylinderGeometry(0.235, 0.185, 0.32, 8),
    M.gloss,
  );
  chest.position.y = 0.5;
  chest.rotation.y = Math.PI / 8;
  torso.add(chest);

  for (const s of [-1, 1]) {
    const t = s < 0 ? "l" : "r";

    const pec = mesh(
      `pec_plate_${t}`,
      new THREE.BoxGeometry(0.175, 0.2, 0.055),
      M.armor,
    );
    pec.position.set(0.105 * s, 0.545, 0.16);
    pec.rotation.x = -0.2;
    pec.rotation.y = -0.24 * s;
    torso.add(pec);

    const pecLower = mesh(
      `pec_lower_${t}`,
      new THREE.BoxGeometry(0.15, 0.09, 0.05),
      M.carbon,
    );
    pecLower.position.set(0.1 * s, 0.42, 0.17);
    pecLower.rotation.x = -0.05;
    pecLower.rotation.y = -0.2 * s;
    torso.add(pecLower);

    const dot = mesh(
      `pec_led_${t}`,
      new THREE.CylinderGeometry(0.013, 0.013, 0.012, 16),
      M.amber,
    );
    dot.rotation.x = Math.PI / 2 - 0.2;
    dot.position.set(0.115 * s, 0.6, 0.2);
    torso.add(dot);

    const chipRow = strip(`pec_led_cyan_${t}`, 0.05, 0.01, M.cyan);
    chipRow.position.set(0.1 * s, 0.465, 0.195);
    chipRow.rotation.z = 0.35 * s;
    torso.add(chipRow);
  }

  // центральна колона грудини — біло-блакитна смуга у карбоновому каналі
  const channel = mesh(
    "sternum_channel",
    new THREE.BoxGeometry(0.06, 0.26, 0.035),
    M.carbon,
  );
  channel.position.set(0, 0.545, 0.185);
  channel.rotation.x = -0.14;
  torso.add(channel);

  const bar = strip("sternum_bar", 0.02, 0.2, M.white);
  bar.position.set(0, 0.545, 0.206);
  bar.rotation.x = -0.14;
  torso.add(bar);

  const barCaps = [0.655, 0.435];
  barCaps.forEach((y, i) => {
    const cap = strip(`sternum_cap_${i}`, 0.036, 0.014, M.cyan);
    cap.position.set(0, y, 0.205);
    cap.rotation.x = -0.14;
    torso.add(cap);
  });

  // комір і спинна плита
  const collar = mesh(
    "collar",
    new THREE.CylinderGeometry(0.125, 0.165, 0.07, 8),
    M.carbon,
  );
  collar.position.y = 0.69;
  collar.rotation.y = Math.PI / 8;
  torso.add(collar);

  const backPlate = mesh(
    "back_plate",
    new THREE.BoxGeometry(0.34, 0.3, 0.06),
    M.armor,
  );
  backPlate.position.set(0, 0.52, -0.16);
  backPlate.rotation.x = 0.1;
  torso.add(backPlate);

  const backSpine = strip("back_spine_led", 0.014, 0.22, M.cyan);
  backSpine.position.set(0, 0.52, -0.193);
  backSpine.rotation.x = 0.1;
  backSpine.rotation.y = Math.PI;
  torso.add(backSpine);

  // ---- плечі: шаруваті сегментовані наплічники ----
  for (const s of [-1, 1]) {
    const t = s < 0 ? "l" : "r";
    const shells: Array<[number, number, number]> = [
      [0.135, 0.62, 0.42],
      [0.115, 0.66, 0.28],
      [0.095, 0.7, 0.14],
    ];

    shells.forEach(([r, lat, tilt], i) => {
      const sh = mesh(
        `pauldron_${t}_${i}`,
        new THREE.SphereGeometry(r, 32, 24, 0, Math.PI * 2, 0, Math.PI * lat),
        i ? M.armor : M.gloss,
      );
      sh.position.set((0.3 + i * 0.012) * s, 0.63 + i * 0.018, 0);
      sh.rotation.z = (0.4 + tilt * 0.3) * s;
      torso.add(sh);
    });

    const slash = strip(`pauldron_slash_${t}`, 0.013, 0.1, M.amber);
    slash.position.set(0.29 * s, 0.655, 0.115);
    slash.rotation.z = 0.72 * s;
    torso.add(slash);

    const joint = mesh(
      `shoulder_joint_${t}`,
      new THREE.SphereGeometry(0.068, 28, 22),
      M.trim,
    );
    joint.position.set(0.275 * s, 0.56, 0);
    torso.add(joint);

    const jring = mesh(
      `joint_ring_${t}`,
      new THREE.TorusGeometry(0.05, 0.007, 10, 28),
      M.carbon,
    );
    jring.rotation.y = Math.PI / 2;
    jring.position.set(0.297 * s, 0.56, 0);
    torso.add(jring);

    const jled = mesh(
      `joint_led_${t}`,
      new THREE.CylinderGeometry(0.016, 0.016, 0.01, 16),
      M.cyan,
    );
    jled.rotation.z = Math.PI / 2;
    jled.position.set(0.31 * s, 0.56, 0);
    torso.add(jled);

    const upper = mesh(
      `upper_arm_${t}`,
      new THREE.CapsuleGeometry(0.056, 0.14, 8, 22),
      M.carbon,
    );
    upper.position.set(0.305 * s, 0.43, 0);
    upper.rotation.z = 0.12 * s;
    torso.add(upper);

    const armPlate = mesh(
      `arm_plate_${t}`,
      new THREE.BoxGeometry(0.07, 0.13, 0.06),
      M.armor,
    );
    armPlate.position.set(0.34 * s, 0.44, 0.02);
    armPlate.rotation.z = 0.12 * s;
    torso.add(armPlate);

    const elbow = mesh(
      `elbow_${t}`,
      new THREE.SphereGeometry(0.052, 22, 18),
      M.trim,
    );
    elbow.position.set(0.32 * s, 0.31, 0);
    torso.add(elbow);

    const eled = strip(`elbow_led_${t}`, 0.03, 0.011, M.cyan);
    eled.position.set(0.32 * s, 0.31, 0.055);
    torso.add(eled);

    const forearm = mesh(
      `forearm_${t}`,
      new THREE.CapsuleGeometry(0.066, 0.13, 8, 24),
      M.gloss,
    );
    forearm.position.set(0.33 * s, 0.18, 0.02);
    forearm.rotation.x = -0.08;
    torso.add(forearm);

    const wled = strip(`wrist_led_${t}`, 0.014, 0.08, M.cyan);
    wled.position.set(0.345 * s, 0.16, 0.09);
    torso.add(wled);
  }

  // ---- шия ----
  const neck = mesh(
    "neck",
    new THREE.CylinderGeometry(0.055, 0.07, 0.08, 20),
    M.trim,
  );
  neck.position.y = 0.755;
  torso.add(neck);

  const neckRing = mesh(
    "neck_ring",
    new THREE.TorusGeometry(0.062, 0.006, 10, 28),
    M.carbon,
  );
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.y = 0.79;
  torso.add(neckRing);

  // ---- голова: видовжений глянцевий шолом із закритим візором ----
  const head = new THREE.Group();
  head.name = "head";
  head.position.set(0, 0.92, 0);
  torso.add(head);

  const helmet = mesh("helmet", new THREE.SphereGeometry(0.125, 48, 40), M.gloss);
  helmet.scale.set(0.82, 1.14, 1.0);
  head.add(helmet);

  const visor = mesh(
    "visor_glass",
    new THREE.SphereGeometry(
      0.117,
      48,
      40,
      -Math.PI * 0.36,
      Math.PI * 0.72,
      Math.PI * 0.2,
      Math.PI * 0.52,
    ),
    M.visor,
  );
  visor.scale.set(0.86, 1.16, 1.04);
  head.add(visor);

  const brow = mesh(
    "brow_ridge",
    new THREE.TorusGeometry(0.105, 0.007, 10, 40, Math.PI * 0.8),
    M.armor,
  );
  brow.rotation.x = Math.PI / 2 + 0.25;
  brow.rotation.z = Math.PI * 0.6;
  brow.position.set(0, 0.075, 0.01);
  brow.scale.set(0.82, 1, 1.05);
  head.add(brow);

  const chin = mesh(
    "chin_guard",
    new THREE.CylinderGeometry(0.06, 0.042, 0.055, 20),
    M.carbon,
  );
  chin.position.set(0, -0.125, 0.028);
  head.add(chin);

  // тонкі щокові діоди — це і є «погляд»
  const eyes = new THREE.Group();
  eyes.name = "eyes";
  head.add(eyes);

  for (const s of [-1, 1]) {
    const e = strip(`cheek_led_${s < 0 ? "l" : "r"}`, 0.012, 0.06, M.cyan);
    // Єдина правка геометрії проти оригіналу: там смужки на z=0.088 тонули
    // під оболонкою шолома (її поверхня в цій точці ≈0.097) і «погляду» не було
    // видно взагалі. Виносимо їх назовні — саме вони показують, куди робот дивиться.
    e.position.set(0.065 * s, -0.01, 0.104);
    e.rotation.z = 0.55 * s;
    e.rotation.y = 0.4 * s;
    e.userData.home = e.position.clone();
    eyes.add(e);
  }

  // вушні капсули з бурштиновим штифтом
  for (const s of [-1, 1]) {
    const t = s < 0 ? "l" : "r";

    const pod = mesh(
      `ear_pod_${t}`,
      new THREE.CylinderGeometry(0.038, 0.044, 0.032, 20),
      M.carbon,
    );
    pod.rotation.z = Math.PI / 2;
    pod.position.set(0.096 * s, -0.015, -0.012);
    head.add(pod);

    const pin = mesh(
      `ear_pin_${t}`,
      new THREE.CylinderGeometry(0.012, 0.012, 0.036, 14),
      M.amber,
    );
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0.098 * s, -0.015, -0.012);
    head.add(pin);
  }

  const dispose = () => {
    robot.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.geometry.dispose();
    });
    Object.values(M).forEach((material) => material.dispose());
  };

  return { robot, torso, head, eyes, materials: M, dispose };
}
