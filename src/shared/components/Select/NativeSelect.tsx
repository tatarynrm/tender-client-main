// // "use client";

// // import React, { useState, useRef, useEffect } from "react";
// // import { ChevronDown, Check } from "lucide-react";
// // import { cn } from "@/shared/utils";

// // interface NativeSelectProps {
// //   label: string;
// //   value: any;
// //   onChange: (v: string) => void;
// //   options?: { ids: string | number; value: string }[];
// //   placeholder?: string;
// // }

// // export const CustomSelect = ({
// //   label,
// //   value,
// //   onChange,
// //   options = [],
// //   placeholder = "Всі",
// // }: NativeSelectProps) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const containerRef = useRef<HTMLDivElement>(null);

// //   // Закриття при кліку поза компонентом
// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   const selectedOption = options.find((opt) => String(opt.ids) === String(value));

// //   return (
// //     <div className="space-y-1.5 flex-1 relative" ref={containerRef}>
// //       {/* Label */}
// //       <label className="text-[10px] font-bold text-muted-foreground/80 dark:text-zinc-500 uppercase tracking-[0.15em] ml-1 select-none">
// //         {label}
// //       </label>

// //       {/* Trigger Button */}
// //       <button
// //         type="button"
// //         onClick={() => setIsOpen(!isOpen)}
// //         className={cn(
// //           "w-full h-11 px-4 flex items-center justify-between transition-all duration-200",
// //           "bg-zinc-100 dark:bg-zinc-900",
// //           "border rounded-xl text-sm shadow-sm",
// //           isOpen
// //             ? "border-orange-500 ring-2 ring-orange-500/10"
// //             : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
// //           "text-left"
// //         )}
// //       >
// //         <span className={cn(
// //           "truncate",
// //           !selectedOption ? "text-muted-foreground" : "text-zinc-900 dark:text-zinc-100"
// //         )}>
// //           {selectedOption ? selectedOption.value : placeholder}
// //         </span>
// //         <ChevronDown
// //           className={cn(
// //             "h-4 w-4 text-zinc-400 transition-transform duration-300",
// //             isOpen && "rotate-180 text-orange-500"
// //           )}
// //           strokeWidth={2.5}
// //         />
// //       </button>

// //       {/* Beautiful Dropdown Menu */}
// //       {isOpen && (
// //         <div className={cn(
// //           "absolute z-[100] w-full mt-2 p-1.5",
// //           "bg-white dark:bg-zinc-900",
// //           "border border-zinc-200 dark:border-zinc-800",
// //           "rounded-2xl shadow-2xl shadow-orange-500/5 dark:shadow-black/50",
// //           "animate-in fade-in zoom-in-95 duration-200 origin-top"
// //         )}>
// //           <div className="max-h-[240px] overflow-y-auto overflow-x-hidden custom-scrollbar py-1">
// //             {/* Placeholder / Reset Option */}
// //             <div
// //               onClick={() => { onChange(""); setIsOpen(false); }}
// //               className="px-3 py-2.5 mb-1 text-xs font-medium text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors"
// //             >
// //               {placeholder}
// //             </div>

// //             {/* Options List */}
// //             {options.map((opt) => {
// //               const isSelected = String(opt.ids) === String(value);
// //               return (
// //                 <div
// //                   key={opt.ids}
// //                   onClick={() => {
// //                     onChange(String(opt.ids));
// //                     setIsOpen(false);
// //                   }}
// //                   className={cn(
// //                     "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 mb-0.5",
// //                     isSelected
// //                       ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
// //                       : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50"
// //                   )}
// //                 >
// //                   <span className="text-sm font-medium leading-none truncate">
// //                     {opt.value}
// //                   </span>
// //                   {isSelected && (
// //                     <Check className="h-4 w-4 animate-in zoom-in duration-300" strokeWidth={3} />
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       )}

// //       {/* Global CSS for the ultra-thin scrollbar */}
// //       <style jsx global>{`
// //         .custom-scrollbar::-webkit-scrollbar {
// //           width: 4px;
// //         }
// //         .custom-scrollbar::-webkit-scrollbar-track {
// //           background: transparent;
// //         }
// //         .custom-scrollbar::-webkit-scrollbar-thumb {
// //           background: #e4e4e7; /* zinc-200 */
// //           border-radius: 20px;
// //         }
// //         .dark .custom-scrollbar::-webkit-scrollbar-thumb {
// //           background: #27272a; /* zinc-800 */
// //         }
// //         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
// //           background: #f97316; /* orange-500 */
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default CustomSelect;

// "use client";

// import React, { useState, useRef, useEffect, useMemo } from "react";
// import { ChevronDown, Check, Search, X } from "lucide-react";
// import { cn } from "@/shared/utils";

// interface CustomSelectProps {
//   label: string;
//   value: any;
//   onChange: (v: string) => void;
//   options?: { ids: string | number; value: string }[];
//   placeholder?: string;
//   showSearch?: boolean; // Новий проп для умовного пошуку
// }

// export const CustomSelect = ({
//   label,
//   value,
//   onChange,
//   options = [],
//   placeholder = "Всі",
//   showSearch = false,
// }: CustomSelectProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const containerRef = useRef<HTMLDivElement>(null);
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   // Закриття при кліку поза межами
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Автофокус на інпут при відкритті, якщо пошук увімкнено
//   useEffect(() => {
//     if (isOpen && showSearch) {
//       const timeout = setTimeout(() => searchInputRef.current?.focus(), 10);
//       return () => clearTimeout(timeout);
//     }
//     if (!isOpen) setSearchQuery("");
//   }, [isOpen, showSearch]);

//   const selectedOption = options.find(
//     (opt) => String(opt.ids) === String(value)
//   );

//   // Фільтрація працює тільки якщо є запит, інакше повертає всі опції
//   const filteredOptions = useMemo(() => {
//     if (!showSearch || !searchQuery) return options;
//     return options.filter((opt) =>
//       opt.value.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [options, searchQuery, showSearch]);

//   return (
//     <div className="space-y-1.5 flex-1 relative" ref={containerRef}>
//       <label className="text-[10px] font-bold text-muted-foreground/80 dark:text-zinc-500 uppercase tracking-[0.15em] ml-1 select-none">
//         {label}
//       </label>

//       {/* Button Trigger */}
//       <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={cn(
//           "w-full h-11 px-4 flex items-center justify-between transition-all duration-200",
//           "bg-zinc-100 dark:bg-zinc-900",
//           "border rounded-xl text-sm shadow-sm",
//           isOpen
//             ? "border-orange-500 ring-2 ring-orange-500/10"
//             : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
//           "text-left"
//         )}
//       >
//         <span
//           className={cn(
//             "truncate",
//             !selectedOption
//               ? "text-muted-foreground"
//               : "text-zinc-900 dark:text-zinc-100"
//           )}
//         >
//           {selectedOption ? selectedOption.value : placeholder}
//         </span>
//         <ChevronDown
//           className={cn(
//             "h-4 w-4 text-zinc-400 transition-transform duration-300",
//             isOpen && "rotate-180 text-orange-500"
//           )}
//           strokeWidth={2.5}
//         />
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div
//           className={cn(
//             "absolute z-[100] w-full mt-2 p-1.5",
//             "bg-white dark:bg-zinc-900",
//             "border border-zinc-200 dark:border-zinc-800",
//             "rounded-2xl shadow-2xl shadow-orange-500/10",
//             "animate-in fade-in zoom-in-95 duration-200 origin-top"
//           )}
//         >
//           {/* Умовний рендеринг ПОШУКУ */}
//           {showSearch && (
//             <div className="relative mb-2 px-1 pt-1">
//               <div className="relative flex items-center">
//                 <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400" />
//                 <input
//                   ref={searchInputRef}
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Пошук..."
//                   className={cn(
//                     "w-full h-9 pl-9 pr-8 bg-zinc-50 dark:bg-zinc-800/50",
//                     "border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm outline-none",
//                     "focus:border-orange-500/50 transition-all",
//                     "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
//                   )}
//                 />
//                 {searchQuery && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSearchQuery("");
//                     }}
//                     className="absolute right-2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md"
//                   >
//                     <X className="h-3 w-3 text-zinc-500" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="max-h-[220px] overflow-y-auto overflow-x-hidden custom-scrollbar">
//             {/* Опція "Всі" (показуємо, якщо пошук порожній або вимкнений) */}
//             {!searchQuery && (
//               <div
//                 onClick={() => {
//                   onChange("");
//                   setIsOpen(false);
//                 }}
//                 className="px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer mb-1"
//               >
//                 {placeholder}
//               </div>
//             )}

//             {/* Render Options */}
//             <div className="space-y-0.5">
//               {filteredOptions.length > 0 ? (
//                 filteredOptions.map((opt) => {
//                   const isSelected = String(opt.ids) === String(value);
//                   return (
//                     <div
//                       key={opt.ids}
//                       onClick={() => {
//                         onChange(String(opt.ids));
//                         setIsOpen(false);
//                       }}
//                       className={cn(
//                         "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
//                         isSelected
//                           ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
//                           : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
//                       )}
//                     >
//                       <span className="text-sm font-medium truncate">
//                         {opt.value}
//                       </span>
//                       {isSelected && (
//                         <Check
//                           className="h-3.5 w-3.5 text-orange-500"
//                           strokeWidth={3}
//                         />
//                       )}
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="py-8 text-center text-xs text-zinc-400">
//                   Нічого не знайдено
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #e4e4e7;
//           border-radius: 10px;
//         }
//         .dark .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #3f3f46;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CustomSelect;
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/shared/utils";

interface CustomSelectProps {
  label: string;
  value: any; // Може бути "1" або "1,2,3"
  onChange: (v: string) => void;
  options?: { ids: string | number; value: string }[];
  placeholder?: string;
  showSearch?: boolean;
  isMulti?: boolean; // Новий проп для мульти-вибору
}

export const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Всі",
  showSearch = false,
  isMulti = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Масив обраних ID (парсимо рядок з value)
  const selectedIds = useMemo(() => {
    if (!value) return [];
    return String(value).split(",").filter(Boolean);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && showSearch) {
      const timeout = setTimeout(() => searchInputRef.current?.focus(), 10);
      return () => clearTimeout(timeout);
    }
    if (!isOpen) setSearchQuery("");
  }, [isOpen, showSearch]);

  // Відображення тексту в кнопці
  const triggerText = useMemo(() => {
    if (selectedIds.length === 0) return placeholder;
    if (!isMulti) {
      return (
        options.find((opt) => String(opt.ids) === selectedIds[0])?.value ||
        placeholder
      );
    }
    return `Обрано: ${selectedIds.length}`;
  }, [selectedIds, options, placeholder, isMulti]);

  const handleSelect = (id: string) => {
    const stringId = String(id);

    if (!isMulti) {
      onChange(stringId);
      setIsOpen(false);
      return;
    }

    const selectedIds = value ? String(value).split(",").filter(Boolean) : [];

    let newSelected: string[];
    if (selectedIds.includes(stringId)) {
      newSelected = selectedIds.filter((i) => i !== stringId);
    } else {
      newSelected = [...selectedIds, stringId];
    }

    // Повертаємо рядок "UA,DE,PL"
    onChange(newSelected.join(","));
  };

  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchQuery) return options;
    return options.filter((opt) =>
      opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, showSearch]);

  return (
    <div className="space-y-1.5 flex-1 relative" ref={containerRef}>
      <label className="text-[10px] font-bold text-muted-foreground/80 dark:text-zinc-500 uppercase tracking-[0.15em] ml-1 select-none">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-4 flex items-center justify-between transition-all duration-200",
          "bg-zinc-100 dark:bg-zinc-900",
          "border rounded-xl text-sm shadow-sm",
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/10"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
          "text-left"
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedIds.length === 0
              ? "text-muted-foreground"
              : "text-zinc-900 dark:text-zinc-100 font-medium"
          )}
        >
          {triggerText}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform duration-300",
            isOpen && "rotate-180 text-orange-500"
          )}
          strokeWidth={2.5}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-[100] w-full mt-2 p-1.5",
            "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
            "rounded-2xl shadow-2xl shadow-orange-500/10 animate-in fade-in zoom-in-95 duration-200 origin-top"
          )}
        >
          {showSearch && (
            <div className="relative mb-2 px-1 pt-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук..."
                className="w-full h-9 pl-9 pr-8 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm outline-none focus:border-orange-500/50 transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          <div className="max-h-[220px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            {!searchQuery && (
              <div
                onClick={() => {
                  onChange("");
                  !isMulti && setIsOpen(false);
                }}
                className="px-3 py-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg cursor-pointer mb-1 transition-colors"
              >
                Очистити вибір
              </div>
            )}

            <div className="space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = selectedIds.includes(String(opt.ids));
                  return (
                    <div
                      key={opt.ids}
                      onClick={() => handleSelect(String(opt.ids))}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
                        isSelected
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isMulti && (
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-orange-500 border-orange-500"
                                : "border-zinc-300 dark:border-zinc-600"
                            )}
                          >
                            {isSelected && (
                              <Check
                                className="h-3 w-3 text-white"
                                strokeWidth={4}
                              />
                            )}
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">
                          {opt.value}
                        </span>
                      </div>
                      {!isMulti && isSelected && (
                        <Check
                          className="h-3.5 w-3.5 text-orange-500"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Нічого не знайдено
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default CustomSelect;
