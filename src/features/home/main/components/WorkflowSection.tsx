"use client";
import { motion } from "framer-motion";
import { ClipboardList, Truck, CheckCircle2, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "Тендер",
    desc: "Публікуєте запит за 2 хвилини",
    icon: ClipboardList,
  },
  {
    title: "Відбір",
    desc: "AI аналізує найкращі пропозиції",
    icon: ShieldCheck,
  },
  { title: "Логістика", desc: "Трекінг вантажу в реальному часі", icon: Truck },
  { title: "Фінал", desc: "Автоматичний документообіг", icon: CheckCircle2 },
];

export default function WorkflowSection() {
  return (
    <section className="py-24 relative overflow-hidden" id="workflow">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
          Як працює ICTender
        </h2>
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Лінія зв'язку для десктопу */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="relative flex flex-col items-center text-center z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                <step.icon className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
