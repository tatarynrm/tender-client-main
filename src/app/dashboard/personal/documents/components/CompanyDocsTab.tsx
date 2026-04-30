"use client";

import React from "react";
import { DocumentTable } from "./DocumentTable";

const DATA = [
  { id: "1", name: "Виписка з ЄДР", date: "12.01.2024", size: "1.2 MB", type: "PDF" },
  { id: "2", name: "Статут компанії", date: "15.01.2024", size: "4.5 MB", type: "PDF" },
  { id: "3", name: "Довідка про відсутність заборгованості", date: "02.04.2024", size: "0.8 MB", type: "DOCX" },
];

export function CompanyDocsTab() {
  return <DocumentTable documents={DATA} title="Документи компанії" />;
}
