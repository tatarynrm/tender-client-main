// import { useState, useEffect } from "react";

// export type FontSizeKey = "xs" | "sm" | "base" | "lg";

// export function useFontSize() {
//   const [size, setSize] = useState<FontSizeKey>("sm");

//   useEffect(() => {
//     const saved = localStorage.getItem("font-size") as FontSizeKey;
//     if (saved) setSize(saved);
//   }, []);

//   const updateSize = (newSize: FontSizeKey) => {
//     setSize(newSize);
//     localStorage.setItem("font-size", newSize);
//   };

//   const config = {
//     xs: { label: "text-[7px]", main: "text-[9px]", title: "text-[10px]" },
//     sm: { label: "text-[8px]", main: "text-[10px]", title: "text-[11px]" },
//     base: { label: "text-[9px]", main: "text-[12px]", title: "text-[13px]" },
//     lg: { label: "text-[10px]", main: "text-[14px]", title: "text-[15px]" },
//   }[size];

//   return { size, updateSize, config };
// }
