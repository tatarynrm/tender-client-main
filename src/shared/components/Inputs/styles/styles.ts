export const inputVariants = {
  base: `
    block w-full px-3 py-2 text-[13px] 
    text-slate-900 dark:text-slate-100 
    bg-white dark:bg-slate-900
    border transition-all duration-200 ease-in-out
    outline-none focus:ring-0
  `,
  default: `
    border-zinc-200 dark:border-zinc-800
    focus:border-teal-500 dark:focus:border-teal-500
  `,
  error: `
    border-red-500
    focus:border-red-600
  `,
  disabled: "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900",
};