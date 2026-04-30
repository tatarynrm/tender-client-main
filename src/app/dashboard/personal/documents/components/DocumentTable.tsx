"use client";

import React from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

interface DocItem {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
}

interface DocumentTableProps {
  documents: DocItem[];
  title: string;
}

export function DocumentTable({ documents, title }: DocumentTableProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
            {title}
          </h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest h-9"
        >
          Завантажити новий
        </Button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30">
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Назва документа</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Дата завантаження</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Розмір</th>
              <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{doc.name}</p>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{doc.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[13px] font-medium">{doc.date}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-500">
                    {doc.size}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all active:scale-95">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
