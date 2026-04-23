"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/shared/components/ui";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ChangePasswordSchema, TypeChangePasswordSchema } from "../schemes/profile.schema";
import { useChangePasswordMutation } from "../hooks/useChangePasswordMutation";

import { motion, AnimatePresence } from "framer-motion";

interface ChangePasswordDialogProps {
  children: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut",
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export function ChangePasswordDialog({ children }: ChangePasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { changePassword, isPending } = useChangePasswordMutation();

  const form = useForm<TypeChangePasswordSchema>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: TypeChangePasswordSchema) => {
    changePassword(values, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden !rounded-[2.5rem] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <div className="p-8 lg:p-10 relative z-10">
          <DialogHeader className="mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Безпека
                </DialogTitle>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Зміна паролю доступу
                </p>
              </div>
            </motion.div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-5"
              >
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 ml-1 mb-2 block">Поточний пароль</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-14 rounded-2xl border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-lg tracking-widest placeholder:tracking-normal"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase ml-1 mt-1.5 text-rose-500" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-100 dark:border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white dark:bg-zinc-950 px-4 text-zinc-300">Нові дані</span>
                  </div>
                </div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 ml-1 mb-2 block">Новий пароль</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-14 rounded-2xl border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-lg tracking-widest placeholder:tracking-normal"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase ml-1 mt-1.5 text-rose-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 ml-1 mb-2 block">Підтвердження</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-14 rounded-2xl border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-lg tracking-widest placeholder:tracking-normal"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase ml-1 mt-1.5 text-rose-500" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-16 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
                  >
                    <AnimatePresence mode="wait">
                      {isPending ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Оновлення...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Зберегти зміни
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
