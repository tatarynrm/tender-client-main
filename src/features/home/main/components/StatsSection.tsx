"use client";
import { motion } from "framer-motion";

const stats = [
  { label: "Вантажівок в системі", value: "12,000+" },
  { label: "Тендерів щомісяця", value: "450+" },
  { label: "Економія бюджету", value: "18%" },
  { label: "Активних замовників", value: "2.5k" },
];

export default function StatsSection() {
  return (
    <section className="py-20 w-full max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-teal-500/50 transition-colors text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}