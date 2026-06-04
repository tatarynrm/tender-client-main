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
  FileText,
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
  { id: "adaptive", name: "Автоматичний (Системний)", desc: "Підлаштовується під темну/світлу тему отримувача", color: "bg-gradient-to-r from-slate-200 to-slate-800" },
  { id: "plain", name: "Простий текст", desc: "Стандартне чисте оформлення", color: "bg-slate-500" },
  { id: "corporate", name: "Корпоративний синій", desc: "Преміум дизайн з градієнтною шапкою", color: "bg-blue-600" },
  { id: "newsletter", name: "Стильний дайджест", desc: "Темно-синій банер з категоріями", color: "bg-slate-900" },
  { id: "minimal", name: "Теплий мінімалізм", desc: "Елегантний дизайн з золотистим акцентом", color: "bg-amber-600" },
  { id: "tech", name: "Технологічний (Tech)", desc: "Сучасний темний дизайн з індиго акцентами", color: "bg-indigo-600" },
  { id: "eco", name: "Еко Природний", desc: "Світлий дизайн з м'якими зеленими відтінками", color: "bg-emerald-600" },
  { id: "alert", name: "Термінове (Alert)", desc: "Привертає увагу, червоні відтінки", color: "bg-rose-600" },
  { id: "elegant", name: "Елегантний Монохром", desc: "Стильний чорно-білий дизайн", color: "bg-zinc-800" },
  { id: "creative", name: "Креативний Яскравий", desc: "Градієнт рожевий/фіолетовий, соковитий", color: "bg-fuchsia-500" },
  { id: "medical", name: "Чистий (Медичний)", desc: "Світло-блакитний, вселяє довіру", color: "bg-cyan-500" },
  { id: "education", name: "Академічний", desc: "Класичний синій з жовтим акцентом", color: "bg-sky-700" },
  { id: "finance", name: "Фінансовий", desc: "Глибокий зелений та золотий, діловий стиль", color: "bg-teal-700" },
  { id: "realestate", name: "Нерухомість", desc: "Морський синій та бежевий", color: "bg-stone-700" },
  { id: "holiday", name: "Зимовий (Holiday)", desc: "Світло-блакитний з сніжним настроєм", color: "bg-sky-300" },
  { id: "summer", name: "Літній Світлий", desc: "Жовтий, оптимістичний та теплий", color: "bg-yellow-400" },
  { id: "pastel", name: "Ніжний пастельний", desc: "Рожеві та світлі відтінки, дуже м'яко", color: "bg-pink-300" },
  { id: "retro", name: "Ретро / Вінтаж", desc: "Коричневі та бежеві відтінки, вінтажний вайб", color: "bg-orange-800" },
  { id: "cyberpunk", name: "Кіберпанк", desc: "Неонові кольори на темному фоні", color: "bg-purple-900" },
  { id: "luxury", name: "Luxury Золото", desc: "Чорний з розкішними золотими акцентами", color: "bg-yellow-600" },
  { id: "hitech", name: "Hi-Tech Світлий", desc: "Білий, сірі лінії та світло-сині деталі", color: "bg-blue-400" }
];

export default function EmailBroadcastComponent() {
  const queryClient = useQueryClient();
  const { user: userSocket } = useSockets();
  const { config } = useFontSize();
  const { title, main, label, icon: iconSize } = config;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<"file" | "manual">("file");
  const [itemName, setItemName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newEmail, setNewEmail] = useState("");

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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [selectedMailings, setSelectedMailings] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"append" | "replace">("append");

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

  // Sync inputs with selected mailing details ONLY when the selected campaign changes
  useEffect(() => {
    if (selectedDetails && selectedDetails.id !== selectedId) {
      // This is a safety check but usually selectedDetails matches selectedId
      // We will actually rely on a separate ref or a simpler approach:
      // When selectedId changes, the effect runs, but we can't just depend on selectedDetails.
    }
  }, []);

  const [initializedId, setInitializedId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedDetails) {
      if (selectedDetails.id !== initializedId) {
        setEmailTitle(selectedDetails.email_title || "");
        setBodyText(selectedDetails.email_content || "");
        setTemplateId(selectedDetails.template_id || "plain");
        setAttachments([]);
        setActiveTab("edit");
        setInitializedId(selectedDetails.id);
      }
    } else {
      if (initializedId !== null) {
        setEmailTitle("");
        setBodyText("");
        setTemplateId("plain");
        setAttachments([]);
        setActiveTab("edit");
        setInitializedId(null);
      }
    }
  }, [selectedDetails, initializedId]);

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
      if (creationMode === "file" && !selectedFile) throw new Error("Будь ласка, оберіть Excel файл");

      const formData = new FormData();
      formData.append("item_name", itemName);
      if (creationMode === "file" && selectedFile) {
        formData.append("file", selectedFile);
      }

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
      setCreationMode("file");
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      setSelectedId(data.mailingId);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при створенні розсилки");
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!selectedId) return;
      const { data } = await api.post(`/admin/mailing/${selectedId}/address`, { email });
      return data;
    },
    onSuccess: () => {
      toast.success("Адресу успішно додано");
      setNewEmail("");
      queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при додаванні адреси");
    },
  });

  const removeAddressMutation = useMutation({
    mutationFn: async (addressId: number) => {
      if (!selectedId) return;
      const { data } = await api.delete(`/admin/mailing/${selectedId}/address/${addressId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Адресу видалено");
      queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при видаленні адреси");
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
      setShowConfirmModal(false);
      setConfirmText("");
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при запуску");
      setShowConfirmModal(false);
      setConfirmText("");
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

  const deleteMailingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return;
      const { data } = await api.delete(`/admin/mailing/${selectedId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Розсилку успішно видалено");
      setSelectedId(null);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при видаленні розсилки");
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    },
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selectedMailings);
      if (ids.length === 0) return;
      const { data } = await api.post("/admin/mailing/bulk-delete", { ids });
      return data;
    },
    onSuccess: () => {
      toast.success("Вибрані розсилки видалено");
      setSelectedMailings(new Set());
      setShowBulkDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
      if (selectedId && selectedMailings.has(selectedId)) {
        setSelectedId(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при масовому видаленні");
      setShowBulkDeleteModal(false);
    },
  });

  const uploadAddressesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return;
      if (!uploadFile) throw new Error("Виберіть файл");

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("mode", uploadMode);

      const { data } = await api.post(`/admin/mailing/${selectedId}/upload-addresses`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Адреси успішно завантажено");
      setShowUploadModal(false);
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ["mailing-details", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["mailings-list"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Помилка при завантаженні адрес");
    },
  });


  const toggleMailingSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedMailings);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMailings(newSet);
  };

  const handleSelectAllMailings = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMailings(new Set(mailings.map((m: any) => m.id)));
    } else {
      setSelectedMailings(new Set());
    }
  };

  // Client Side Template Preview Compiler
  const compileClientTemplate = (tempId: string, content: string, title: string) => {
    const year = new Date().getFullYear();
    const t = title || "Тема листа";
    const c = content || "Напишіть текст повідомлення...";
    switch (tempId) {
      case "adaptive":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>:root { color-scheme: light dark; } @media (prefers-color-scheme: dark) { body, .container { background-color: #0f172a !important; color: #f8fafc !important; } .container { border-color: #334155 !important; } h1, h2, p, span, div { color: #f8fafc !important; } hr { border-top-color: #334155 !important; } .footer p { color: #94a3b8 !important; } }</style></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; background-color: #f1f5f9; margin: 0; padding: 20px;"><div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;"><h2 style="margin-top: 0;">${t}</h2>${c}<hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 25px; margin-bottom: 20px;"><div class="footer"><p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "plain":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; line-height: 1.6;"><h2>${t}</h2>${c}<hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;"><p style="font-size: 11px; color: #94a3b8; text-align: center;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></body></html>`;
      case "corporate":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background-color: #f1f5f9; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;"><div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); background-color: #1e3a8a; padding: 40px 30px; text-align: center; color: #ffffff;"><h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${t}</h1></div><div style="padding: 40px 30px; line-height: 1.7; font-size: 15px;">${c}</div><div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;"><p style="margin:0 0 10px 0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "newsletter":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; background-color: #fafafa; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;"><div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); background-color: #0f172a; padding: 50px 40px; color: #ffffff;"><div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">Новини та Оновлення</div><h1 style="margin: 0; font-size: 28px; font-weight: 800; line-height: 1.2;">${t}</h1></div><div style="padding: 40px; line-height: 1.8; font-size: 15px;">${c}</div><div style="background-color: #0f172a; padding: 30px; text-align: center; font-size: 11px; color: #94a3b8;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "minimal":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2c3e50; background-color: #fdfbf7; margin: 0; padding: 50px 20px;"><div style="max-width: 580px; margin: 0 auto; padding: 20px;"><h2 style="font-size: 22px; font-weight: 600; color: #1a252f; margin-bottom: 24px; border-left: 3px solid #d4af37; padding-left: 12px;">${t}</h2><div style="line-height: 1.6; font-size: 15px; color: #34495e; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">${c}</div><div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1ece4; font-size: 12px; color: #95a5a6; text-align: center;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "tech":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', sans-serif; color: #cbd5e1; background-color: #0f172a; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden;"><div style="padding: 30px; border-bottom: 1px solid #334155;"><h1 style="margin: 0; font-size: 24px; color: #f8fafc; font-weight: 700;"><span style="color: #6366f1; margin-right: 10px;">&gt;</span>${t}</h1></div><div style="padding: 30px; line-height: 1.6; font-size: 14px;">${c}</div><div style="padding: 20px 30px; background-color: #0b1120; font-size: 11px; text-align: center; color: #64748b;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "eco":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; color: #3f614a; background-color: #f0f8f4; margin: 0; padding: 30px 15px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 2px solid #e0efe6; overflow: hidden;"><div style="background-color: #d1e8db; padding: 30px; text-align: center;"><h1 style="margin: 0; font-size: 22px; color: #1f402c;">🌿 ${t}</h1></div><div style="padding: 30px; line-height: 1.6; font-size: 15px;">${c}</div><div style="background-color: #e0efe6; padding: 20px; text-align: center; font-size: 11px; color: #5a7d67;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "alert":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', sans-serif; color: #1f2937; background-color: #fdf2f2; margin: 0; padding: 30px 15px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border-left: 6px solid #e11d48; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;"><div style="padding: 20px 30px; background-color: #fff1f2; border-bottom: 1px solid #ffe4e6;"><h1 style="margin: 0; font-size: 22px; color: #be123c;">⚠️ ${t}</h1></div><div style="padding: 30px; line-height: 1.6; font-size: 15px;">${c}</div><div style="padding: 15px 30px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #6b7280;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "elegant":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Times New Roman', serif; color: #000000; background-color: #ffffff; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; border: 1px solid #000000; padding: 40px;"><div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 20px; margin-bottom: 30px;"><h1 style="margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase;">${t}</h1></div><div style="line-height: 1.8; font-size: 16px;">${c}</div><div style="margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center; font-size: 11px; font-family: Arial, sans-serif; color: #666666;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "creative":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; background-color: #fdf4ff; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 30px; overflow: hidden; box-shadow: 0 10px 25px rgba(217, 70, 239, 0.1);"><div style="background: linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%); background-color: #d946ef; padding: 50px 30px; text-align: center; color: #ffffff;"><h1 style="margin: 0; font-size: 26px; font-weight: 900;">${t}</h1></div><div style="padding: 40px 30px; line-height: 1.7; font-size: 15px;">${c}</div><div style="background-color: #fdf4ff; padding: 20px; text-align: center; font-size: 12px; color: #c026d3;"><p style="margin:0;">✨ © ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "medical":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; background-color: #ecfeff; margin: 0; padding: 30px 15px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border-top: 4px solid #06b6d4; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);"><div style="padding: 30px 30px 10px;"><h1 style="margin: 0; font-size: 24px; color: #0891b2; font-weight: 600;">${t}</h1></div><div style="padding: 20px 30px 40px; line-height: 1.6; font-size: 15px;">${c}</div><div style="background-color: #f8fafc; padding: 15px 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "education":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Georgia, serif; color: #333333; background-color: #f4f7f9; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #c8d8e4;"><div style="background-color: #034f84; padding: 35px 30px; text-align: center; border-bottom: 4px solid #f7cac9;"><h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: normal;">${t}</h1></div><div style="padding: 40px 30px; line-height: 1.8; font-size: 16px;">${c}</div><div style="background-color: #f4f7f9; padding: 20px; text-align: center; font-size: 11px; font-family: Arial, sans-serif; color: #777777; border-top: 1px solid #c8d8e4;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "finance":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; background-color: #f3f4f6; margin: 0; padding: 30px 15px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);"><div style="padding: 30px; border-bottom: 2px solid #0f766e; background-color: #f8fafc; border-radius: 4px 4px 0 0;"><h1 style="margin: 0; font-size: 22px; color: #0f766e;">${t}</h1></div><div style="padding: 30px; line-height: 1.6; font-size: 14px;">${c}</div><div style="padding: 20px 30px; background-color: #111827; color: #9ca3af; font-size: 11px; text-align: center; border-radius: 0 0 4px 4px;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "realestate":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #3e3e3e; background-color: #ece8e1; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;"><div style="background-color: #1c3d5a; padding: 40px 30px; text-align: center;"><h1 style="margin: 0; font-size: 26px; color: #fdfbf7; font-weight: 300; letter-spacing: 1px;">${t}</h1></div><div style="padding: 40px 30px; line-height: 1.6; font-size: 15px;">${c}</div><div style="background-color: #f3f0ea; padding: 25px 30px; text-align: center; font-size: 12px; color: #827e77;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "holiday":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif; color: #0f172a; background-color: #e0f2fe; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 4px solid #bae6fd; overflow: hidden;"><div style="background-color: #38bdf8; padding: 30px; text-align: center; color: #ffffff;"><h1 style="margin: 0; font-size: 28px;">❄️ ${t} ❄️</h1></div><div style="padding: 30px; line-height: 1.6; font-size: 15px;">${c}</div><div style="background-color: #f0f9ff; padding: 15px; text-align: center; font-size: 12px; color: #0284c7;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "summer":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #422006; background-color: #fef08a; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 8px 20px rgba(234, 179, 8, 0.3); overflow: hidden;"><div style="background-color: #facc15; padding: 35px 30px; text-align: center;"><h1 style="margin: 0; font-size: 26px; color: #713f12; font-weight: 800;">☀️ ${t}</h1></div><div style="padding: 40px 30px; line-height: 1.7; font-size: 16px;">${c}</div><div style="background-color: #fef9c3; padding: 20px; text-align: center; font-size: 12px; color: #854d0e;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "pastel":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; color: #4a4a4a; background-color: #fce7f3; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden;"><div style="background-color: #fbcfe8; padding: 40px 30px; text-align: center;"><h1 style="margin: 0; font-size: 24px; color: #be185d; font-weight: bold;">${t}</h1></div><div style="padding: 40px 30px; line-height: 1.7; font-size: 15px;">${c}</div><div style="padding: 20px; text-align: center; font-size: 11px; color: #9d174d;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "retro":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Courier New', Courier, monospace; color: #45301f; background-color: #d7ccc8; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #efebe9; border: 2px dashed #8d6e63; padding: 30px;"><div style="text-align: center; border-bottom: 2px solid #8d6e63; padding-bottom: 20px; margin-bottom: 20px;"><h1 style="margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase; color: #3e2723;">${t}</h1></div><div style="line-height: 1.6; font-size: 15px;">${c}</div><div style="margin-top: 30px; text-align: center; font-size: 12px; color: #5d4037;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "cyberpunk":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Verdana', sans-serif; color: #0ff; background-color: #000; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid #f0f; box-shadow: 0 0 10px #f0f; padding: 30px;"><div style="text-align: left; border-bottom: 2px solid #ff0; padding-bottom: 10px; margin-bottom: 20px;"><h1 style="margin: 0; font-size: 24px; color: #f0f; text-transform: uppercase; letter-spacing: 2px;">${t}</h1></div><div style="line-height: 1.6; font-size: 14px; color: #ccc;">${c}</div><div style="margin-top: 30px; text-align: right; font-size: 10px; color: #ff0; border-top: 1px dashed #333; padding-top: 10px;"><p style="margin:0;">SYSTEM.YEAR: ${year} // ICT-WEST. ALL RIGHTS RESERVED.</p></div></div></body></html>`;
      case "luxury":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: 'Times New Roman', Times, serif; color: #e5e7eb; background-color: #000000; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #d4af37; padding: 40px;"><div style="text-align: center; margin-bottom: 40px;"><h1 style="margin: 0; font-size: 28px; color: #d4af37; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">${t}</h1></div><div style="line-height: 1.8; font-size: 15px; color: #d1d5db;">${c}</div><div style="margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #374151; padding-top: 20px;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      case "hitech":
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; background-color: #e5e7eb; margin: 0; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"><div style="padding: 25px 30px; border-bottom: 1px solid #f3f4f6;"><h1 style="margin: 0; font-size: 20px; color: #111827; font-weight: 600;">${t}</h1></div><div style="padding: 30px; line-height: 1.6; font-size: 14px;">${c}</div><div style="background-color: #f9fafb; padding: 15px 30px; text-align: left; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6;"><p style="margin:0;">© ${year} Група компаній ІСТ-Захід. Усі права захищено.</p></div></div></body></html>`;
      default:
        return c;
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

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-white/5">
            <label className="flex items-center gap-2 cursor-pointer px-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 bg-white"
                checked={mailings.length > 0 && selectedMailings.size === mailings.length}
                onChange={handleSelectAllMailings}
                disabled={mailings.length === 0}
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Вибрати всі</span>
            </label>
            {selectedMailings.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Видалити ({selectedMailings.size})
              </button>
            )}
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
                      <div className="flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 bg-white cursor-pointer"
                            checked={selectedMailings.has(item.id)}
                            onChange={(e) => toggleMailingSelection(item.id, e as any)}
                          />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                          {item.item_name}
                        </span>
                      </div>
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
                <div className="flex items-center gap-3">
                  {selectedDetails && getStatusBadge(selectedDetails.status)}
                  {selectedDetails && selectedDetails.status !== "RUNNING" && (
                    <button
                      onClick={() => {
                        setDeleteConfirmText("");
                        setShowDeleteModal(true);
                      }}
                      className="p-2 border border-rose-200 dark:border-rose-900/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all"
                      title="Видалити розсилку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
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
                <div className="p-4 bg-white border border-slate-200 dark:border-white/5 dark:bg-slate-900/50 rounded-[1.5rem] space-y-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
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
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Виберіть стиль оформлення (HTML Шаблон)
                        </label>
                        <div className="max-h-[180px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {templatesList.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => setTemplateId(t.id)}
                              className={cn(
                                "p-2 rounded-lg border-2 text-left cursor-pointer transition-all flex flex-col gap-0.5 hover:scale-[1.02]",
                                templateId === t.id
                                  ? "border-blue-500 bg-blue-500/5 shadow-sm"
                                  : "border-slate-200 dark:border-white/5 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", t.color)} />
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t.name}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 leading-tight line-clamp-2">{t.desc}</span>
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
                        onClick={() => {
                          if (!emailTitle.trim()) {
                            toast.error("Тема листа обов’язкова");
                            return;
                          }
                          if (!bodyText.trim()) {
                            toast.error("Текст листа обов’язковий");
                            return;
                          }
                          setConfirmText("");
                          setShowConfirmModal(true);
                        }}
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

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-56">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Пошук емейла..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                      {selectedDetails.status !== "RUNNING" && (
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" /> З файлу
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedDetails.status !== "RUNNING" && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <Mail className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Введіть нову email адресу..."
                        className="flex-1 bg-transparent border-none text-xs focus:ring-0 px-2 outline-none dark:text-white font-semibold"
                      />
                      <button
                        onClick={() => {
                          if (!newEmail.trim()) {
                            toast.error("Введіть email");
                            return;
                          }
                          addAddressMutation.mutate(newEmail);
                        }}
                        disabled={addAddressMutation.isPending}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {addAddressMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Додати email
                      </button>
                    </div>
                  )}

                  <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner max-h-60 overflow-y-auto custom-scrollbar">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-white/5 sticky top-0 font-bold text-slate-500 border-b border-slate-200 dark:border-white/5">
                        <tr>
                          <th className="p-3">Email адреса</th>
                          <th className="p-3">Статус</th>
                          {selectedDetails.status !== "RUNNING" && <th className="p-3 text-right">Дії</th>}
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
                            {selectedDetails.status !== "RUNNING" && (
                              <td className="p-3 text-right">
                                {(addr.ids_status === "PENDING" || addr.ids_status === "FAILED") && (
                                  <button
                                    onClick={() => removeAddressMutation.mutate(addr.id)}
                                    disabled={removeAddressMutation.isPending}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Видалити"
                                  >
                                    {removeAddressMutation.isPending && removeAddressMutation.variables === addr.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </td>
                            )}
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
                Введіть назву та оберіть спосіб завантаження отримувачів.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCreationMode("file")}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    creationMode === "file" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  З Excel файлу
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("manual")}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    creationMode === "manual" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  Вручну (пуста)
                </button>
              </div>
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

              {creationMode === "file" && (
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
              )}
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
                {creationMode === "file" ? "Створити та імпортувати" : "Створити розсилку"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 flex flex-col gap-5">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" /> Підтвердження розсилки
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                Будь ласка, підтвердіть запуск відправки
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-xs leading-relaxed font-semibold">
                Увага! Запуск розсилки надішле листи на {selectedDetails?.stats.total || 0} адрес. Скасувати окремі листи буде неможливо.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Введіть «ICT» для підтвердження:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Введіть ICT..."
                  className="w-full p-3 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold tracking-wider text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/5 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText("");
                }}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={() => startMailingMutation.mutate()}
                disabled={confirmText !== "ICT" || startMailingMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
              >
                {startMailingMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Підтвердити запуск
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 flex flex-col gap-5">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Видалення розсилки
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                Підтвердіть остаточне видалення кампанії
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl text-xs leading-relaxed font-semibold">
                Увага! Ця дія незворотна. Буде видалено розсилку «{selectedDetails?.item_name}» разом із усіма отримувачами ({selectedDetails?.stats.total || 0} адрес) та вкладеними файлами з диска.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Введіть «ICT» для підтвердження видалення:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Введіть ICT..."
                  className="w-full p-3 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all text-sm font-semibold tracking-wider text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/5 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={() => deleteMailingMutation.mutate()}
                disabled={deleteConfirmText !== "ICT" || deleteMailingMutation.isPending}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
              >
                {deleteMailingMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Видалити кампанію
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 flex flex-col gap-5">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Масове видалення
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                Підтвердіть остаточне видалення {selectedMailings.size} кампаній
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl text-xs leading-relaxed font-semibold">
                Увага! Ця дія незворотна. Усі вибрані розсилки ({selectedMailings.size} шт.) будуть видалені разом із усіма їх отримувачами та вкладеними файлами.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Введіть «ICT» для підтвердження видалення:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Введіть ICT..."
                  className="w-full p-3 border border-slate-200 dark:border-white/10 dark:bg-slate-900 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none transition-all text-sm font-semibold tracking-wider text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/5 justify-end">
              <button
                onClick={() => {
                  setShowBulkDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={() => bulkDeleteMutation.mutate()}
                disabled={deleteConfirmText !== "ICT" || bulkDeleteMutation.isPending}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
              >
                {bulkDeleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Видалити всі ({selectedMailings.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Addresses Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 flex flex-col gap-5">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Завантаження адрес
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                Завантажте список отримувачів з Excel файлу
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Файл Excel (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Режим завантаження</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <input
                      type="radio"
                      name="uploadMode"
                      value="append"
                      checked={uploadMode === "append"}
                      onChange={() => setUploadMode("append")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Додати до існуючих</div>
                      <div className="text-[10px] text-slate-500 leading-tight">Нові адреси будуть додані в кінець списку. Існуючі залишаться.</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={uploadMode === "replace"}
                      onChange={() => setUploadMode("replace")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Замінити невідправлені</div>
                      <div className="text-[10px] text-slate-500 leading-tight">Всі адреси, які ще НЕ були надіслані, будуть видалені і замінені новими з файлу.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/5 justify-end">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={() => uploadAddressesMutation.mutate()}
                disabled={!uploadFile || uploadAddressesMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all font-bold text-xs flex items-center gap-1.5"
              >
                {uploadAddressesMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Завантажити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
