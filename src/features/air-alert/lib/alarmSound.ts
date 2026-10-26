// Звук тривоги/відбою через WebAudio — без зовнішнього аудіофайлу.

let ctx: AudioContext | null = null;
let armed = false;

/**
 * Розблоковує WebAudio: браузери тримають AudioContext "suspended", доки
 * користувач не зробить перший жест на сторінці. Викликаємо один раз при
 * монтуванні віджета — і до моменту тривоги контекст уже буде готовий грати.
 */
export function armAudio(): void {
  if (typeof window === "undefined" || armed) return;
  armed = true;
  const unlock = () => {
    const ac = getCtx();
    if (ac && ac.state === "suspended") void ac.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Тривожний двотоновий сигнал (сирена) */
export function playAlarm(): void {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  // три хвилі "вгору-вниз"
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.6;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.5);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }
}

/** М'який сигнал відбою */
export function playClear(): void {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const notes = [523, 659, 784]; // до-мі-соль
  notes.forEach((f, i) => {
    const t = now + i * 0.15;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  });
}
