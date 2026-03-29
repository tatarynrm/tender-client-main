export const inputVariants = {
  base: `
    block w-full px-3 py-2 text-[13px] 
    text-slate-900 dark:text-slate-100 
    bg-white dark:bg-slate-900
    border transition-all duration-200 ease-in-out
    outline-none focus:ring-0
  `,
  default: `
    border-slate-200 dark:border-zinc-800
    focus:border-indigo-500 dark:focus:border-indigo-500
  `,
  error: `
    border-red-500
    focus:border-red-600
  `,
  disabled: "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900",
};