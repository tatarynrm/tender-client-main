export const buttonVariants = {
  base: "relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-wider text-[12px] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:grayscale",
  variants: {
    primary: "bg-teal-600 text-white shadow-md shadow-teal-500/20 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30",
    secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
    outline: "border-2 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-500",
    ghost: "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5",
    danger: "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600",
  },
  sizes: {
    sm: "h-9 px-4",
    md: "h-11 px-6",
    lg: "h-13 px-8 text-[13px]",
    icon: "h-11 w-11",
  }
};