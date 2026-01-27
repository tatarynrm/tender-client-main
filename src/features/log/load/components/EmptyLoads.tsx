"use client";

import { AppButton } from "@/shared/components/Buttons/AppButton";
import { motion } from "framer-motion";
import { PackageOpen, SearchX } from "lucide-react";


export const EmptyLoads = ({ onReset }: { onReset?: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="mb-6 p-6 rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600"
      >
        <PackageOpen size={64} strokeWidth={1} />
      </motion.div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        Вантажів не знайдено
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
        На жаль, за вашими параметрами нічого не знайдено. Спробуйте змінити фільтри або зачекайте на нові замовлення.
      </p>

      {onReset && (
        <AppButton
          variant="outline" 
          onClick={onReset}
          leftIcon={<SearchX size={18} />}
        >
          Скинути всі фільтри
        </AppButton>
      )}
    </motion.div>
  );
};