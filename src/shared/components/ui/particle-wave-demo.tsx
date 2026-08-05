"use client";

import { ParticleWave } from "@/shared/components/ui/particle-wave";

/** Довідковий приклад використання ParticleWave на весь екран. */
const DemoOne = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <ParticleWave className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 font-mono text-sm text-foreground/80">
        <p>Particle Wave Animation</p>
        <p className="mt-1 text-xs opacity-60">Move your mouse to interact</p>
      </div>
    </div>
  );
};

export { DemoOne };
