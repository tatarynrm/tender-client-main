"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/instance.api";
import { useSockets } from "@/shared/providers/SocketProvider";
import {
  Mail,
  Upload,
  Play,
  Pause,
  Loader2,
  CheckCircle2,
  Plus,
  Search,
  FileSpreadsheet,
  Paperclip,
  Trash2,
  Eye,
  Smartphone,
  Monitor,
  Layout,
} from "lucide-react";
import { toast } from "sonner";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { cn } from "@/shared/utils";
import RichTextEditor from "./RichTextEditor";

interface MailingStats {
  total: number;
  pending: number;
  processing: number;
  done: number;
  failed: number;
}

interface MailingItem {
  id: number;
  item_name: string;
  email_title?: string;
  email_content?: string;
  template_id?: string;
  created_at?: string;
  stats: MailingStats;
  status: "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED";
}

interface MailingDetails extends MailingItem {
  addresses: {
    data: Array<{
      id: number;
      email: string;
      ids_status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
      created_at: string;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  attachments?: Array<{
    name: string;
    size: number;
  }>;
}

const templatesList = [
  { id: "plain", name: "Простий текст", desc: "Стандартне чисте оформлення для ділових листів", color: "bg-slate-500" },
  { id: "corporate", name: "Корпоративний синій", desc: "Преміум дизайн з градієнтною шапкою та футером", color: "bg-blue-600" },
  { id: "newsletter", name: "Стильний дайджест", desc: "Темно-синій банер з категоріями, ідеальний для новин", color: "bg-slate-900" },
  { id: "minimal", name: "Теплий мінімалізм", desc: "Елегантний дизайн з лініями та золотистим акцентом", color: "bg-amber-600" },
];

export default function EmailBroadcastComponent() {
  const queryClient = useQueryClient();
  const { user: userSocket } = useSockets();
  const { config } = useFontSize();
  const { title, main, label, icon: iconSize } = config;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [emailTitle, setEmailTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [templateId, setTemplateId] = useState<string>("plain");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);

  const [listSearch, setListSearch] = useState("");
  const [debouncedListSearch, setDebouncedListSearch] = useState("");
  const [listPage, setListPage] = useState<number>(1);
  const [listLimit, setListLimit] = useState<number>(10);

  // Debounce search queries to reduce database load
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on search
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Debounce campaign list search queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedListSearch(listSearch);
      setListPage(1); // reset list page 1 on search
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [listSearch]);

  // Reset pagination state when campaign selection changes
  useEffect(() => {
    setPage(1);
    setSearchQuery("");
    setDebouncedSearch("");
  }, [selectedId]);

  interface PaginatedMailings {
    data: MailingItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }

  // Queries
  const { data: mailingsData, isLoading: listLoading } = useQuery<PaginatedMailings>({
    queryKey: ["mailings-list", listPage, listLimit, debouncedListSearch],
    queryFn: async () => {
      const { data } = await api.get("/admin/mailing/list", {
        params: { page: listPage, limit: listLimit, search: debouncedListSearch },
      });
      return data;
    },
  });

  const mailings = mailingsData?.data || [];
  const mailingsMeta = mailingsData?.meta;

  const { data: selectedDetails, isLoading: detailsLoading } = useQuery<MailingDetails>({
    queryKey: ["mailing-details", selectedId, page, limit, debouncedSearch],
    queryFn: async () => {
      if (!selectedId) return null as any;
      const { data } = await api.get(`/admin/mailing/${selectedId}`, {
        params: { page, limit, search: debouncedSearch },
      });
      return data;
    },
    enabled: !!selectedId,
  });

  // Sync inputs with selected mailing details
  useEffect(() => {
    if (selectedDetails) {
      setEmailTitle(selectedDetails.email_title || "");
      setBodyText(selectedDetails.email_content || "");
      setTemplateId(selectedDetails.template_id || "plain");
    } else {
      setEmailTitle("");
      setBodyText("");
      setTemplateId("plain");
    }
    setAttachments([]);
    setActiveTab("edit");
  }, [selectedDetails]);

  // Socket Integration for Live Updates
  useEffect(() => {
    if (!userSocket) return;

    const handleProgress = (data: { mailingId: number; itemName: string; status: any; stats: MailingStats }) => {
      // Invalidate queries to refresh lists and details dynamically
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      if (selectedId === data.mailingId) {
        queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
      }
    };

    const handleCompleted = (data: { mailingId: number }) => {
      toast.success(`Розсилку #${data.mailingId} успішно завершено!`);
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      if (selectedId === data.mailingId) {
        queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
      }
    };

    userSocket.on("mailing_progress", handleProgress);
    userSocket.on("mailing_completed", handleCompleted);

    return () => {
      userSocket.off("mailing_progress", handleProgress);
      userSocket.off("mailing_completed", handleCompleted);
    };
  }, [userSocket, selectedId, queryClient]);

  // Mutations
  const createMailingMutation = useMutation({
    mutationFn: async () => {
      if (!itemName.trim()) throw new Error("Назва розсилки не може бути порожньою");
      if (!selectedFile) throw new Error("Будь ласка, оберіть Excel файл");

      const formData = new FormData();
      formData.append("item_name", itemName);
      formData.append("file", selectedFile);

      const { data } = await api.post("/admin/mailing/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Кампанію успішно створено!");
      setShowCreateModal(false);
      setItemName("");
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      setSelectedId(data.mailingId);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при створенні розсилки");
    },
  });

  const startMailingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return;
      if (!emailTitle.trim()) throw new Error("Тема листа обов’язкова");
      if (!bodyText.trim()) throw new Error("Текст листа обов’язковий");

      const formData = new FormData();
      formData.append("emailTitle", emailTitle);
      formData.append("emailContent", bodyText);
      formData.append("templateId", templateId);

      attachments.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await api.post(`/admin/mailing/${selectedId}/start`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Розсилку запущено");
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при запуску");
    },
  });

  const pauseMailingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return;
      const { data } = await api.post(`/admin/mailing/${selectedId}/pause`);
      return data;
    },
    onSuccess: () => {
      toast.success("Розсилку призупинено");
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при зупинці");
    },
  });

  // Client Side Template Preview Compiler
  const compileClientTemplate = (tempId: string, content: string, title: string) => {
    const year = new Date().getFullYear();
    switch (tempId) {
      case "corporate":
        return `<html>
<head>
  <style>
    body { font-family: sans-serif; color: #1e293b; background-color: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 24px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .content { padding: 24px 20px; line-height: 1.6; font-size: 14px; }
    .footer { background-color: #f8fafc; padding: 16px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title || "Тема листа"}</h1>
    </div>
    <div class="content">
      ${content || "Напишіть текст повідомлення..."}
    </div>
    <div class="footer">
      <p>© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p>
    </div>
  </div>
</body>
</html>`;

      case "newsletter":
        return `<html>
<head>
  <style>
    body { font-family: sans-serif; color: #334155; background-color: #fafafa; margin: 0; padding: 20px; }
    .container { max-width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; }
    .badge { display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 20px; color: #ffffff; }
    .banner h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 24px 20px; line-height: 1.6; font-size: 14px; }
    .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <div class="badge">Новини та Оновлення</div>
      <h1>${title || "Тема листа"}</h1>
    </div>
    <div class="content">
      ${content || "Напишіть текст повідомлення..."}
    </div>
    <div class="footer">
      <p>Ви отримали цей лист, оскільки зареєстровані в ICTender.</p>
    </div>
  </div>
</body>
</html>`;

      case "minimal":
        return `<html>
<head>
  <style>
    body { font-family: sans-serif; color: #2c3e50; background-color: #fdfbf7; margin: 0; padding: 20px; }
    .container { max-width: 100%; padding: 10px; }
    .title { font-size: 18px; font-weight: 600; color: #1a252f; margin-bottom: 16px; border-left: 3px solid #d4af37; padding-left: 10px; }
    .content { line-height: 1.6; font-size: 14px; color: #34495e; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1ece4; font-size: 11px; color: #95a5a6; }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="title">${title || "Тема листа"}</h2>
    <div class="content">
      ${content || "Напишіть текст повідомлення..."}
    </div>
    <div class="footer">
      З повагою, Група компаній ІСТ-Захід.
    </div>
  </div>
</body>
</html>`;

      case "plain":
      default:
        return `<html>
<head>
  <style>
    body { font-family: sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 10px; }
    .container { max-width: 100%; background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    ${content || "Напишіть текст повідомлення..."}
  </div>
</body>
</html>`;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper values
  const filteredAddresses = selectedDetails?.addresses?.data || [];
  const addressesMeta = selectedDetails?.addresses?.meta;

  const getStatusBadge = (status: MailingItem["status"]) => {
    switch (status) {
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse">
            Активна відправка
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Призупинено
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Завершено
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
            Чернетка
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Mail className="w-8 h-8 text-blue-500" />
            Email Розсилки
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">
            Керування розсилками та відстеження статусу в реальному часі
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-blue-500/10 hover:scale-[1.01] transition-all font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Створити розсилку
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of mailings */}
        <div className="xl:col-span-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm h-[calc(100vh-12rem)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Розсилки ({mailingsMeta?.total || 0})
            </h2>
          </div>

          {/* Search input for mailings */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Пошук розсилки..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-semibold"
            />
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {listLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : mailings.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm font-semibold">
                Кампаній не знайдено.<br />Створіть першу!
              </div>
            ) : (
              mailings.map((item) => {
                const total = item.stats.total;
                const processed = item.stats.done + item.stats.failed;
                const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-2.5",
                      selectedId === item.id
                        ? "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30 dark:border-blue-500/20 shadow-md shadow-blue-500/5"
                        : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {item.item_name}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    {item.created_at && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold -mt-1">
                        {new Date(item.created_at).toLocaleString("uk-UA", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Надіслано: {processed} / {total}</span>
                      <span>{pct}%</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          item.status === "RUNNING" ? "bg-blue-500" : "bg-slate-500"
                        )}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination for mailings */}
          {mailingsMeta && mailingsMeta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setListPage((p) => Math.max(p - 1, 1))}
                disabled={listPage === 1}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg font-bold disabled:opacity-40 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
              >
                Назад
              </button>
              <span className="font-bold text-slate-600 dark:text-slate-400">
                {listPage} / {mailingsMeta.totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setListPage((p) => Math.min(p + 1, mailingsMeta.totalPages))}
                disabled={listPage >= mailingsMeta.totalPages}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg font-bold disabled:opacity-40 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
              >
                Вперед
              </button>
            </div>
          )}
        </div>

        {/* Right Column: detailed view & control panel */}
        <div className="xl:col-span-8 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm h-[calc(100vh-12rem)] flex flex-col">
          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-2 text-blue-500" />
              <span>Завантаження деталей...</span>
            </div>
          ) : !selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
              <Mail className="w-20 h-20 stroke-[0.5] mb-4 text-blue-500/40 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                Панель керування розсилками
              </h3>
              <p className="text-sm max-w-sm">
                Оберіть кампанію розсилки зі списку ліворуч, щоб переглянути детальну статистику, керувати процесом або розпочати відправку.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pr-1">
              {/* Selected Campaign Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedDetails?.item_name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500 font-bold">ID: #{selectedDetails?.id}</span>
                    {selectedDetails?.created_at && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/15" />
                        <span className="text-xs text-slate-500 font-bold">
                          Створено: {new Date(selectedDetails.created_at).toLocaleString("uk-UA", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {selectedDetails && getStatusBadge(selectedDetails.status)}
              </div>

              {/* Grid of Summary Stats */}
              {selectedDetails && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl text-center">
                    <span className="block text-xl font-black text-slate-900 dark:text-white">
                      {selectedDetails.stats.total}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Усього</span>
                  </div>
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
                    <span className="block text-xl font-black text-blue-600 dark:text-blue-400">
                      {selectedDetails.stats.pending}
                    </span>
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Очікують</span>
                  </div>
                  <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                    <span className="block text-xl font-black text-yellow-600 dark:text-yellow-400">
                      {selectedDetails.stats.processing}
                    </span>
                    <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Відправка</span>
                  </div>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                    <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedDetails.stats.done}
                    </span>
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Успішно</span>
                  </div>
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center col-span-2 md:col-span-1">
                    <span className="block text-xl font-black text-rose-600 dark:text-rose-400">
                      {selectedDetails.stats.failed}
                    </span>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Помилки</span>
                  </div>
                </div>
              )}

              {/* Progress bar of current state */}
              {selectedDetails && (
                <div className="p-5 bg-slate-100/30 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-700 dark:text-slate-300">Прогрес відправки</span>
                    <span className="text-blue-600">
                      {selectedDetails.stats.done + selectedDetails.stats.failed} / {selectedDetails.stats.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-3 rounded-full overflow-hidden shadow-inner">
                    <div
                      style={{
                        width: `${selectedDetails.stats.total > 0
                          ? Math.round(
                            ((selectedDetails.stats.done + selectedDetails.stats.failed) /
                              selectedDetails.stats.total) *
                            100
                          )
                          : 0
                          }%`,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                    />
                  </div>
                </div>
              )}

              {/* CONTROL INTERFACE */}
              {selectedDetails && (
                <div className="p-5 bg-white border border-slate-200 dark:border-white/5 dark:bg-slate-900/50 rounded-[2rem] space-y-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" /> Створення та керування повідомленням
                  </h3>

                  {selectedDetails.status === "RUNNING" ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 text-blue-600 rounded-xl text-sm leading-relaxed flex gap-3">
                        <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                        <div>
                          <span className="font-bold block mb-0.5">Йде активна розсилка повідомлень...</span>
                          <span className="text-xs block text-blue-500 mt-1 font-semibold">
                            Тема листа: «{selectedDetails.email_title}»
                          </span>
                          Сторінка оновлюється в реальному часі за допомогою WebSockets. Ви можете призупинити розсилку в будь-який момент.
                        </div>
                      </div>

                      <button
                        onClick={() => pauseMailingMutation.mutate()}
                        disabled={pauseMailingMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg transition-all font-semibold hover:scale-[1.01]"
                      >
                        {pauseMailingMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                        Призупинити відправку
                      </button>
                    </div>
                  ) : selectedDetails.status === "COMPLETED" ? (
                    <div className="space-y-6">
                      <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-500">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <div>
                          <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            Усю розсилку успішно відправлено!
                          </h4>
                          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                            Кампанія розсилки успішно завершена. Усі адреси опрацьовано.
                          </p>
                        </div>
                      </div>

                      {/* Read-Only Mail Details */}
                      <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                          Надісланий лист:
                        </h4>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Тема листа:</span>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                            {selectedDetails.email_title || "(Без теми)"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Використаний стиль (Шаблон):</span>
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                              {templatesList.find(t => t.id === selectedDetails.template_id)?.name || "Простий текст"}
                            </span>
                          </div>
                        </div>

                        {selectedDetails.attachments && selectedDetails.attachments.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Надіслані файли:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedDetails.attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-xs gap-2">
                                  <Paperclip className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={file.name}>
                                    {file.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-auto font-medium">
                                    {(file.size / 1024).toFixed(1)} КБ
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Перегляд контенту:</span>
                            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setPreviewDevice("desktop")}
                                className={cn(
                                  "p-1 transition-colors rounded",
                                  previewDevice === "desktop" ? "bg-white dark:bg-slate-900 text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                              >
                                <Monitor className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewDevice("mobile")}
                                className={cn(
                                  "p-1 transition-colors rounded",
                                  previewDevice === "mobile" ? "bg-white dark:bg-slate-900 text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 flex justify-center items-center">
                            <div
                              className={cn(
                                "transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md",
                                previewDevice === "mobile" ? "w-[360px]" : "w-full max-w-[640px]"
                              )}
                            >
                              <iframe
                                title="Email Live Preview"
                                srcDoc={compileClientTemplate(
                                  selectedDetails.template_id || "plain",
                                  selectedDetails.email_content || "",
                                  selectedDetails.email_title || ""
                                )}
                                className="w-full min-h-[350px] bg-white"
                                style={{ border: "none" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Email Title Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Тема листа (email subject)
                        </label>
                        <input
                          type="text"
                          value={emailTitle}
                          onChange={(e) => setEmailTitle(e.target.value)}
                          placeholder="Введіть тему поштового листа..."
                          className="w-full p-3 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold"
                        />
                      </div>

                      {/* Visual Template Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Виберіть стиль оформлення (HTML Шаблон)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {templatesList.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => setTemplateId(t.id)}
                              className={cn(
                                "p-3 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col gap-1 hover:scale-[1.02]",
                                templateId === t.id
                                  ? "border-blue-500 bg-blue-500/5 shadow-sm"
                                  : "border-slate-200 dark:border-white/5 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={cn("w-2.5 h-2.5 rounded-full", t.color)} />
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 leading-normal">{t.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Composer View with Tabs & Devices */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveTab("edit")}
                              className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1",
                                activeTab === "edit"
                                  ? "bg-blue-500 text-white shadow-sm"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                              )}
                            >
                              <Layout className="w-3.5 h-3.5" /> Редактор
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab("preview")}
                              className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1",
                                activeTab === "preview"
                                  ? "bg-blue-500 text-white shadow-sm"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                              )}
                            >
                              <Eye className="w-3.5 h-3.5" /> Попередній перегляд
                            </button>
                          </div>

                          {activeTab === "preview" && (
                            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setPreviewDevice("desktop")}
                                className={cn(
                                  "p-1 rounded transition-colors",
                                  previewDevice === "desktop" ? "bg-white dark:bg-slate-900 text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                                title="Настільний комп'ютер"
                              >
                                <Monitor className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewDevice("mobile")}
                                className={cn(
                                  "p-1 rounded transition-colors",
                                  previewDevice === "mobile" ? "bg-white dark:bg-slate-900 text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                                title="Мобільний телефон"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Editor Mode */}
                        {activeTab === "edit" ? (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Вміст повідомлення (HTML Текст)
                            </label>
                            <RichTextEditor value={bodyText} onChange={setBodyText} />
                          </div>
                        ) : (
                          /* Visual Preview Mode */
                          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 flex justify-center items-center">
                            <div
                              className={cn(
                                "transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md",
                                previewDevice === "mobile" ? "w-[360px]" : "w-full max-w-[640px]"
                              )}
                            >
                              <iframe
                                title="Email Live Preview"
                                srcDoc={compileClientTemplate(templateId, bodyText, emailTitle)}
                                className="w-full min-h-[350px] bg-white"
                                style={{ border: "none" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Attachments Section */}
                      <div className="space-y-3 bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-blue-500" /> Вкладені файли та зображення
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="text-xs text-blue-500 hover:text-blue-600 font-bold cursor-pointer">
                              + Додати файли
                            </span>
                          </div>
                        </div>

                        {attachments.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {attachments.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs gap-3"
                              >
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={file.name}>
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                                    {(file.size / 1024).toFixed(1)} КБ
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(idx)}
                                    className="text-rose-500 hover:text-rose-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            Вкладених файлів немає. Файли будуть надіслані кожному отримувачу.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => startMailingMutation.mutate()}
                        disabled={startMailingMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all font-semibold active:scale-95 disabled:opacity-50 hover:scale-[1.01]"
                      >
                        {startMailingMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {selectedDetails.status === "PAUSED" ? "Продовжити розсилку" : "Запустити розсилку"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LIST OF ADDRESSES */}
              {selectedDetails && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                      Список адрес отримувачів ({addressesMeta?.total || 0})
                    </h3>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Пошук емейла..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner max-h-60 overflow-y-auto custom-scrollbar">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-white/5 sticky top-0 font-bold text-slate-500 border-b border-slate-200 dark:border-white/5">
                        <tr>
                          <th className="p-3">Email адреса</th>
                          <th className="p-3">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredAddresses.map((addr) => (
                          <tr key={addr.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                              {addr.email}
                            </td>
                            <td className="p-3">
                              {addr.ids_status === "DONE" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                  Успішно
                                </span>
                              ) : addr.ids_status === "FAILED" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600">
                                  Помилка
                                </span>
                              ) : addr.ids_status === "PROCESSING" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 animate-pulse">
                                  Відправляється
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500">
                                  В черзі
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {addressesMeta && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100 dark:border-white/5 pt-3">
                      <span className="font-bold text-slate-500">
                        Показано з {Math.min((page - 1) * limit + 1, addressesMeta.total)} по {Math.min(page * limit, addressesMeta.total)} із {addressesMeta.total} отримувачів
                      </span>

                      <div className="flex items-center gap-4">
                        {/* Limit selector */}
                        <div className="flex items-center gap-1.5 font-bold text-slate-500">
                          <span>Рядків:</span>
                          <select
                            value={limit}
                            onChange={(e) => {
                              setLimit(Number(e.target.value));
                              setPage(1);
                            }}
                            className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1 outline-none text-xs focus:ring-1 focus:ring-blue-500 font-bold"
                          >
                            <option value={20} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">20</option>
                            <option value={50} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">50</option>
                            <option value={100} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">100</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg font-bold disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            Назад
                          </button>
                          <span className="font-bold text-slate-600 dark:text-slate-400">
                            {page} / {addressesMeta.totalPages || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(p + 1, addressesMeta.totalPages))}
                            disabled={page >= addressesMeta.totalPages}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg font-bold disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            Вперед
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 flex flex-col gap-5">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Нова кампанія розсилки
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Введіть назву та завантажте Excel-файл зі списком адрес для розсилки.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Назва розсилки
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Введіть назву (напр. Розсилка Травень 2026)"
                  className="w-full p-3 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Excel Файл отримувачів
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : "Оберіть або перетягніть Excel файл"}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Підтримуються файли .xlsx або .xls
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/5 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setItemName("");
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={() => createMailingMutation.mutate()}
                disabled={createMailingMutation.isPending}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
              >
                {createMailingMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Створити та імпортувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
