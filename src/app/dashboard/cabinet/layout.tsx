import React from "react";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full">
      {children}
    </div>
  );
}
