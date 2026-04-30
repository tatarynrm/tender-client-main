"use client";

import React from "react";
import { DocumentTable } from "./DocumentTable";

const DATA = [
  { id: "1", name: "Ліцензія на міжнародні перевезення", date: "20.02.2024", size: "2.1 MB", type: "PDF" },
  { id: "2", name: "Дозвіл на перевезення небезпечних вантажів", date: "10.03.2024", size: "1.5 MB", type: "PDF" },
];

export function LicensesTab() {
  return <DocumentTable documents={DATA} title="Ліцензії та дозволи" />;
}
