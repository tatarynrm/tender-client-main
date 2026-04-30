"use client";

import React from "react";
import { DocumentTable } from "./DocumentTable";

const DATA = [
  { id: "1", name: "Генеральний договір з ICTender", date: "01.04.2024", size: "3.2 MB", type: "PDF" },
  { id: "2", name: "Додаткова угода №5", date: "15.04.2024", size: "0.5 MB", type: "PDF" },
];

export function ContractsDocsTab() {
  return <DocumentTable documents={DATA} title="Договори та угоди" />;
}
