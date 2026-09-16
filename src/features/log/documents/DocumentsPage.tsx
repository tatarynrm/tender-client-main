"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDownAZ,
  CalendarClock,
  Download,
  FileStack,
  FolderInput,
  FolderPlus,
  FolderUp,
  HardDrive,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
  Star,
  Trash2,
  Upload,
  UploadCloud,
  Weight,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils";
import { documentsService } from "../services/documents.service";
import { DocActionHandlers, DocActionsMenu } from "./components/DocActionsMenu";
import { DocBreadcrumbs } from "./components/DocBreadcrumbs";
import { DocDeleteDialog } from "./components/DocDeleteDialog";
import { DndProps, DocListTable, FileCard, FolderCard } from "./components/DocItems";
import { DocMoveDialog } from "./components/DocMoveDialog";
import { DocNameDialog } from "./components/DocNameDialog";
import { DocPreviewDialog } from "./components/DocPreviewDialog";
import { DocProgressCard } from "./components/DocProgressCard";
import { DocSidebar, ROOT_DROP_ID } from "./components/DocSidebar";
import { useCreateDocFolder } from "./hooks/useCreateDocFolder";
import { useDeleteDocFile } from "./hooks/useDeleteDocFile";
import { useDeleteDocFolder } from "./hooks/useDeleteDocFolder";
import { useDocFavorites } from "./hooks/useDocFavorites";
import { DOCUMENTS_QUERY_KEY, useDocuments } from "./hooks/useDocuments";
import { useDownloadZip, ZipEntry } from "./hooks/useDownloadZip";
import { useUpdateDocFile } from "./hooks/useUpdateDocFile";
import { useUpdateDocFolder } from "./hooks/useUpdateDocFolder";
import { useUploadDocuments } from "./hooks/useUploadDocuments";
import { DocSortKey, DocTarget, DocViewMode, IDocFile, IDocFolder } from "./types/documents.type";
import {
  buildDocsIndex,
  collectDescendantIds,
  collectDroppedItems,
  DOC_ALLOWED_EXT,
  formatDocSize,
  itemsFromFileList,
  matchesQuery,
  saveBlob,
  sortFiles,
  sortFolders,
} from "./utils/documents.utils";

const DND_TYPE = "application/x-ict-doc";
const PREFS_KEY = "ict-docs-prefs";
const EMPTY_TREE = { folders: [], files: [] };

type NameDialogState =
  | { mode: "create" }
  | { mode: "rename"; target: DocTarget }
  | null;

type BulkTarget = { kind: "folder"; folder: IDocFolder } | { kind: "files"; files: IDocFile[] };

interface Props {
  isAdmin: boolean;
}

export default function DocumentsPage({ isAdmin }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data, isLoading, isError: loadFailed } = useDocuments();
  const tree = data ?? EMPTY_TREE;
  // Невдале фонове оновлення не ховає вже завантажені документи
  const isError = loadFailed && !data;
  const index = useMemo(() => buildDocsIndex(tree), [tree]);

  const { favoriteIds, isFavorite, toggleFavorite } = useDocFavorites();
  const { upload, state: uploadState } = useUploadDocuments();
  const { downloadZip, zipProgress } = useDownloadZip();

  const createFolder = useCreateDocFolder();
  const updateFolder = useUpdateDocFolder();
  const deleteFolder = useDeleteDocFolder();
  const updateFile = useUpdateDocFile();
  const deleteFile = useDeleteDocFile();

  // ---------- стан з URL ----------
  const favoritesView = searchParams.get("view") === "favorites";
  const rawFolderId = searchParams.get("folder");
  const currentFolderId = rawFolderId && index.foldersById.has(rawFolderId) ? rawFolderId : null;
  const previewId = searchParams.get("file");

  const setUrl = useCallback(
    (params: { folder?: string | null; file?: string | null; view?: string | null }) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // ---------- локальний стан ----------
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<DocViewMode>("grid");
  const [sortKey, setSortKey] = useState<DocSortKey>("name");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [uploadOver, setUploadOver] = useState(false);
  const [nameDialog, setNameDialog] = useState<NameDialogState>(null);
  const [moveTarget, setMoveTarget] = useState<BulkTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BulkTarget | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
      if (prefs.viewMode === "grid" || prefs.viewMode === "list") setViewMode(prefs.viewMode);
      if (["name", "date", "size"].includes(prefs.sortKey)) setSortKey(prefs.sortKey);
    } catch {
      // без збережених налаштувань
    }
  }, []);

  const savePrefs = (prefs: { viewMode?: DocViewMode; sortKey?: DocSortKey }) => {
    try {
      const current = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
    } catch {
      // ігноруємо
    }
  };

  // webkitdirectory немає в типах React
  useEffect(() => {
    folderInputRef.current?.setAttribute("webkitdirectory", "");
  }, [isAdmin]);

  // Зміна папки/режиму скидає вибір
  useEffect(() => setSelected(new Set()), [currentFolderId, favoritesView, search]);

  // «/» — фокус на пошук, Esc — очистити вибір і пошук
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // defaultPrevented — Esc уже закрив діалог чи меню Radix; вибір тоді не скидаємо
      if (e.key === "Escape" && !e.defaultPrevented && !previewId) {
        if (selected.size) setSelected(new Set());
        else if (document.activeElement === searchRef.current) setSearch("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected.size, previewId]);

  // ---------- що показуємо ----------
  const query = search.trim();
  const showLocation = !!query || favoritesView;

  const locationOf = useCallback(
    (folderId: string | null) =>
      ["Усі документи", ...index.pathOf(folderId).map((f) => f.name)].join(" / "),
    [index],
  );

  /** Для списків: одразу видно найважливіше — папку, де лежить документ. */
  const shortLocationOf = useCallback(
    (folderId: string | null) => {
      const path = index.pathOf(folderId);
      if (!path.length) return "Усі документи";
      return path.length > 1 ? `… / ${path[path.length - 1].name}` : path[0].name;
    },
    [index],
  );

  const { visibleFolders, visibleFiles } = useMemo(() => {
    let folders: IDocFolder[];
    let files: IDocFile[];
    if (query) {
      folders = tree.folders.filter((f) => matchesQuery(f.name, query));
      files = tree.files.filter((f) => matchesQuery(f.name, query));
    } else if (favoritesView) {
      folders = tree.folders.filter((f) => favoriteIds.has(f.id));
      files = tree.files.filter((f) => favoriteIds.has(f.id));
    } else {
      folders = index.childFolders.get(currentFolderId) ?? [];
      files = index.filesByFolder.get(currentFolderId) ?? [];
    }
    return { visibleFolders: sortFolders(folders, sortKey), visibleFiles: sortFiles(files, sortKey) };
  }, [query, favoritesView, tree, favoriteIds, index, currentFolderId, sortKey]);

  const previewFile = previewId ? tree.files.find((f) => f.id === previewId) ?? null : null;

  // ?file= на файл, якого вже немає (видалили, старе посилання) — прибираємо з адреси,
  // інакше сторінка вважає перегляд відкритим (напр. Esc не скидає вибір)
  useEffect(() => {
    if (data && previewId && !previewFile) setUrl({ file: null });
  }, [data, previewId, previewFile, setUrl]);
  const previewList = previewFile && visibleFiles.some((f) => f.id === previewFile.id) ? visibleFiles : previewFile ? [previewFile] : [];

  const currentPath = index.pathOf(currentFolderId);
  const currentName = currentPath.at(-1)?.name ?? "Усі документи";
  const totalSize = useMemo(() => tree.files.reduce((s, f) => s + f.size, 0), [tree.files]);
  const selectedFiles = visibleFiles.filter((f) => selected.has(f.id));

  // Вибір — лише серед показаних файлів: видалені/переміщені кимось не лишаються «вибраними»
  useEffect(() => {
    setSelected((prev) => {
      if (!prev.size) return prev;
      const visible = new Set(visibleFiles.map((f) => f.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleFiles]);

  // ---------- навігація ----------
  const openFolder = (id: string | null) => {
    setSearch("");
    setUrl({ folder: id, file: null, view: null });
  };

  const openFile = (file: IDocFile) => setUrl({ file: file.id });

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelected((prev) =>
      visibleFiles.every((f) => prev.has(f.id)) ? new Set() : new Set(visibleFiles.map((f) => f.id)),
    );

  // ---------- архіви ----------
  const zipEntriesForFolder = (folder: IDocFolder): ZipEntry[] => {
    const ids = collectDescendantIds(index, folder.id);
    return tree.files
      .filter((f) => f.folderId && ids.has(f.folderId))
      .map((file) => {
        const path = index.pathOf(file.folderId);
        const from = path.findIndex((p) => p.id === folder.id);
        return { file, path: [...path.slice(from).map((p) => p.name), file.name].join("/") };
      });
  };

  const zipEntriesForFiles = (files: IDocFile[]): ZipEntry[] => {
    const used = new Set<string>();
    return files.map((file) => {
      let name = file.name;
      for (let i = 1; used.has(name.toLowerCase()); i++) {
        const dot = file.name.lastIndexOf(".");
        name = dot > 0 ? `${file.name.slice(0, dot)} (${i})${file.name.slice(dot)}` : `${file.name} (${i})`;
      }
      used.add(name.toLowerCase());
      return { file, path: name };
    });
  };

  // Через axios, а не посиланням: при помилці (файл видалили, сесія скінчилась)
  // браузер інакше відкрив би сторінку з сирим JSON замість документів
  const downloadFile = async (file: IDocFile) => {
    const toastId = file.size > 5 * 1024 * 1024 ? toast.loading(`Скачування «${file.name}»…`) : undefined;
    try {
      const blob = await documentsService.fetchBlob(file.id);
      saveBlob(blob, file.name);
      if (toastId !== undefined) toast.dismiss(toastId);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      toast.error(
        status === 404 ? "Файл не знайдено — можливо, його вже видалили" : "Не вдалося скачати файл",
        { id: toastId },
      );
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    }
  };

  const copyLink = async (target: DocTarget) => {
    const params = new URLSearchParams();
    if (target.kind === "folder") params.set("folder", target.item.id);
    else {
      if (target.item.folderId) params.set("folder", target.item.folderId);
      params.set("file", target.item.id);
    }
    const url = `${window.location.origin}${pathname}?${params}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Посилання скопійовано", { description: "Відкриється лише для працівників ICT" });
    } catch {
      toast.error("Не вдалося скопіювати посилання");
    }
  };

  // ---------- дії з меню ----------
  const handlers: DocActionHandlers = {
    onOpen: (t) => (t.kind === "folder" ? openFolder(t.item.id) : openFile(t.item)),
    onOpenInTab: (t) => t.kind === "file" && window.open(documentsService.viewUrl(t.item.id), "_blank", "noopener"),
    onDownload: (t) =>
      t.kind === "folder" ? downloadZip(zipEntriesForFolder(t.item), t.item.name) : downloadFile(t.item),
    onCopyLink: copyLink,
    onToggleFavorite: (t) => {
      const was = isFavorite(t.item.id);
      toggleFavorite(t.item.id);
      toast.success(was ? "Прибрано з обраного" : "Додано в обране");
    },
    onReveal: showLocation
      ? (t) => {
          setSearch("");
          const folder = t.kind === "folder" ? t.item.parentId : t.item.folderId;
          setUrl({ folder, view: null, file: null });
        }
      : undefined,
    onRename: (t) => setNameDialog({ mode: "rename", target: t }),
    onMove: (t) => setMoveTarget(t.kind === "folder" ? { kind: "folder", folder: t.item } : { kind: "files", files: [t.item] }),
    onDelete: (t) => setDeleteTarget(t.kind === "folder" ? { kind: "folder", folder: t.item } : { kind: "files", files: [t.item] }),
  };

  // ---------- перетягування: переміщення ----------
  const moveByDrop = (payload: { kind: "folder" | "file"; ids: string[] }, targetId: string | null) => {
    if (payload.kind === "folder") {
      const folder = index.foldersById.get(payload.ids[0]);
      // Кинули на саму себе (випадковий мікро-drag при кліку) — мовчки нічого не робимо
      if (!folder || folder.parentId === targetId || folder.id === targetId) return;
      if (targetId && collectDescendantIds(index, folder.id).has(targetId)) {
        toast.error("Не можна перемістити папку всередину самої себе");
        return;
      }
      updateFolder.mutate({ id: folder.id, payload: { parentId: targetId } });
      return;
    }
    const ids = payload.ids.filter((id) => tree.files.find((f) => f.id === id)?.folderId !== targetId);
    if (!ids.length) return;
    updateFile.mutate({ ids, payload: { folderId: targetId } }, { onSuccess: () => setSelected(new Set()) });
  };

  const dndFor = (target: DocTarget | null): DndProps => {
    if (!isAdmin) return {};
    const dropKey = target ? target.item.id : ROOT_DROP_ID;
    const isFolderTarget = !target || target.kind === "folder";
    // Папка приймає і внутрішнє переміщення, і файли з комп'ютера
    const accepts = (e: React.DragEvent) =>
      e.dataTransfer.types.includes(DND_TYPE) || e.dataTransfer.types.includes("Files");

    return {
      draggable: !!target,
      onDragStart: target
        ? (e) => {
            const ids =
              target.kind === "file" && selected.has(target.item.id) ? [...selected] : [target.item.id];
            e.dataTransfer.setData(DND_TYPE, JSON.stringify({ kind: target.kind, ids }));
            e.dataTransfer.effectAllowed = "move";
          }
        : undefined,
      onDragOver: isFolderTarget
        ? (e) => {
            if (!accepts(e)) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = e.dataTransfer.types.includes(DND_TYPE) ? "move" : "copy";
            if (dropTargetId !== dropKey) setDropTargetId(dropKey);
          }
        : undefined,
      onDragLeave: isFolderTarget ? () => setDropTargetId((t) => (t === dropKey ? null : t)) : undefined,
      onDrop: isFolderTarget
        ? (e) => {
            if (!accepts(e)) return;
            e.preventDefault();
            e.stopPropagation();
            setDropTargetId(null);
            const targetFolderId = target ? target.item.id : null;

            if (e.dataTransfer.types.includes(DND_TYPE)) {
              try {
                moveByDrop(JSON.parse(e.dataTransfer.getData(DND_TYPE)), targetFolderId);
              } catch {
                // чужі дані в drag — ігноруємо
              }
              return;
            }

            // Файли з комп'ютера, кинуті на конкретну папку, — завантажуємо саме в неї
            resetUploadDrag();
            uploadDropped(e.dataTransfer, targetFolderId, target ? target.item.name : "Усі документи");
          }
        : undefined,
    };
  };

  // ---------- перетягування: завантаження з комп'ютера ----------
  const isFileDrag = (e: React.DragEvent) =>
    e.dataTransfer.types.includes("Files") && !e.dataTransfer.types.includes(DND_TYPE);

  const uploadTargetId = favoritesView || query ? null : currentFolderId;
  const uploadTargetName = favoritesView || query ? "Усі документи" : currentName;

  const resetUploadDrag = () => {
    dragDepth.current = 0;
    setUploadOver(false);
  };

  /** Викликати синхронно в обробнику drop — entries забираються до першого await. */
  const uploadDropped = (dataTransfer: DataTransfer, folderId: string | null, targetName: string) => {
    collectDroppedItems(dataTransfer)
      .then(({ items, skipped }) => {
        if (skipped.length) {
          toast.warning(`Не вдалося прочитати: ${skipped.length}`, {
            description: skipped.slice(0, 5).join(", ") + (skipped.length > 5 ? "…" : ""),
          });
        }
        return upload(items, folderId, targetName);
      })
      .catch(() => toast.error("Не вдалося прочитати перетягнуті файли"));
  };

  useEffect(() => {
    // Файл, кинутий повз зону завантаження, браузер інакше відкриє замість сторінки
    const block = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    // Drag скасовано або курсор пішов за межі вікна — рамка завантаження не повинна «залипнути»
    const reset = (e: DragEvent) => {
      // relatedTarget у drag-подіях ненадійний між браузерами — вихід з вікна визначаємо за координатами
      const leftWindow =
        e.type === "dragleave" &&
        (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight);
      if (e.type !== "dragleave" || leftWindow) {
        dragDepth.current = 0;
        setUploadOver(false);
        setDropTargetId(null);
      }
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    window.addEventListener("drop", reset);
    window.addEventListener("dragleave", reset);
    window.addEventListener("dragend", reset);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
      window.removeEventListener("drop", reset);
      window.removeEventListener("dragleave", reset);
      window.removeEventListener("dragend", reset);
    };
  }, []);

  const dropZoneProps = isAdmin
    ? {
        onDragEnter: (e: React.DragEvent) => {
          if (!isFileDrag(e)) return;
          dragDepth.current++;
          setUploadOver(true);
        },
        onDragOver: (e: React.DragEvent) => {
          if (isFileDrag(e)) e.preventDefault();
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!isFileDrag(e)) return;
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setUploadOver(false);
        },
        onDrop: (e: React.DragEvent) => {
          if (!isFileDrag(e)) return;
          e.preventDefault();
          resetUploadDrag();
          uploadDropped(e.dataTransfer, uploadTargetId, uploadTargetName);
        },
      }
    : {};

  // Куди саме піде файл з комп'ютера — для підказки під час перетягування
  const dropHintName =
    dropTargetId === ROOT_DROP_ID
      ? "Усі документи"
      : dropTargetId
        ? index.foldersById.get(dropTargetId)?.name ?? uploadTargetName
        : uploadTargetName;

  const currentFolder = currentFolderId ? index.foldersById.get(currentFolderId) : undefined;

  // ---------- сабміти діалогів ----------
  const submitName = (value: string) => {
    if (!nameDialog) return;
    const close = { onSuccess: () => setNameDialog(null) };
    if (nameDialog.mode === "create") {
      createFolder.mutate({ name: value, parentId: uploadTargetId }, close);
    } else if (nameDialog.target.kind === "folder") {
      updateFolder.mutate({ id: nameDialog.target.item.id, payload: { name: value } }, close);
    } else {
      updateFile.mutate({ ids: [nameDialog.target.item.id], payload: { name: value } }, close);
    }
  };

  const submitMove = (folderId: string | null) => {
    if (!moveTarget) return;
    const done = { onSuccess: () => { setMoveTarget(null); setSelected(new Set()); } };
    if (moveTarget.kind === "folder") {
      updateFolder.mutate({ id: moveTarget.folder.id, payload: { parentId: folderId } }, done);
    } else {
      updateFile.mutate({ ids: moveTarget.files.map((f) => f.id), payload: { folderId } }, done);
    }
  };

  const confirmDelete = (confirm: string) => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "folder") {
      const id = deleteTarget.folder.id;
      deleteFolder.mutate({ id, confirm }, {
        onSuccess: () => {
          setDeleteTarget(null);
          if (currentFolderId && collectDescendantIds(index, id).has(currentFolderId)) {
            openFolder(deleteTarget.folder.parentId);
          }
        },
      });
    } else {
      const ids = deleteTarget.files.map((f) => f.id);
      deleteFile.mutate({ ids, confirm }, {
        onSuccess: () => {
          setDeleteTarget(null);
          setSelected(new Set());
          if (previewId && ids.includes(previewId)) setUrl({ file: null });
        },
      });
    }
  };

  const moveDisabledIds = useMemo(
    () => (moveTarget?.kind === "folder" ? collectDescendantIds(index, moveTarget.folder.id) : new Set<string>()),
    [moveTarget, index],
  );

  const deleteMessage = (() => {
    if (!deleteTarget) return "";
    if (deleteTarget.kind === "folder") {
      const stats = index.totals.get(deleteTarget.folder.id);
      const sub = collectDescendantIds(index, deleteTarget.folder.id).size - 1;
      if (!stats?.files && !sub) return `Порожню папку «${deleteTarget.folder.name}» буде видалено.`;
      return `Папку «${deleteTarget.folder.name}» буде видалено разом із вмістом: ${stats?.files ?? 0} файлів${sub ? `, ${sub} вкладених папок` : ""}. Відновити їх буде неможливо.`;
    }
    return deleteTarget.files.length === 1
      ? `Файл «${deleteTarget.files[0].name}» буде видалено з сервера. Відновити його буде неможливо.`
      : `Буде видалено ${deleteTarget.files.length} файлів. Відновити їх буде неможливо.`;
  })();

  const renameTarget = nameDialog?.mode === "rename" ? nameDialog.target : null;

  // ---------- рендер ----------
  const sortOptions: { key: DocSortKey; label: string; icon: typeof ArrowDownAZ }[] = [
    { key: "name", label: "За назвою", icon: ArrowDownAZ },
    { key: "date", label: "Спочатку нові", icon: CalendarClock },
    { key: "size", label: "За розміром", icon: Weight },
  ];
  const activeSort = sortOptions.find((o) => o.key === sortKey)!;

  return (
    <div className="space-y-4 p-1 md:p-2">
      {/* Шапка */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
            <FileStack className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">Документи</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {tree.folders.length} папок · {tree.files.length} файлів · {formatDocSize(totalSize)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[14rem] flex-1 xl:w-80 xl:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук у всіх документах…"
              className="h-9 rounded-xl pl-9 pr-9"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                title="Очистити"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded border px-1.5 text-[10px] text-muted-foreground sm:block">
                /
              </kbd>
            )}
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl">
                <activeSort.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{activeSort.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((o) => (
                <DropdownMenuItem
                  key={o.key}
                  onSelect={() => {
                    setSortKey(o.key);
                    savePrefs({ sortKey: o.key });
                  }}
                  className={cn(o.key === sortKey && "font-semibold")}
                >
                  <o.icon /> {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-xl border border-slate-200 p-0.5 dark:border-white/10">
            {([["grid", LayoutGrid, "Плитка"], ["list", List, "Список"]] as const).map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                title={label}
                onClick={() => {
                  setViewMode(mode);
                  savePrefs({ viewMode: mode });
                }}
                className={cn(
                  "rounded-lg p-1.5 transition-colors",
                  viewMode === mode
                    ? "bg-blue-500 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl"
                onClick={() => setNameDialog({ mode: "create" })}
              >
                <FolderPlus className="h-4 w-4" /> <span className="hidden sm:inline">Нова папка</span>
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="h-9 gap-1.5 rounded-xl" disabled={!!uploadState}>
                    <Upload className="h-4 w-4" /> Завантажити
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                    <Upload /> Файли
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => folderInputRef.current?.click()}>
                    <FolderUp /> Папку зі вмістом
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={[...DOC_ALLOWED_EXT].join(",")}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) upload(itemsFromFileList(e.target.files), uploadTargetId, uploadTargetName);
                  e.target.value = "";
                }}
              />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) upload(itemsFromFileList(e.target.files), uploadTargetId, uploadTargetName);
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Skeleton className="hidden h-[70vh] rounded-2xl lg:block" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Не вдалося завантажити документи. Оновіть сторінку.
        </div>
      ) : (
        // Зона завантаження охоплює і бічну панель — інакше файл, кинутий на неї, відкриється в браузері
        <div
          {...dropZoneProps}
          className={cn(
            "relative grid gap-4 rounded-2xl transition-colors lg:grid-cols-[260px_minmax(0,1fr)]",
            uploadOver && "outline-2 outline-offset-4 outline-dashed outline-blue-400",
          )}
        >
          <div className="hidden lg:sticky lg:top-0 lg:block lg:h-[calc(100vh-10rem)]">
            <DocSidebar
              isAdmin={isAdmin}
              isFavorite={isFavorite}
              handlers={handlers}
              index={index}
              totalFiles={tree.files.length}
              totalSize={totalSize}
              currentFolderId={query ? null : currentFolderId}
              favoritesView={favoritesView && !query}
              favoritesCount={tree.files.filter((f) => favoriteIds.has(f.id)).length + tree.folders.filter((f) => favoriteIds.has(f.id)).length}
              onOpenFolder={openFolder}
              onShowFavorites={() => {
                setSearch("");
                setUrl({ view: "favorites", folder: null, file: null });
              }}
              dndFor={dndFor}
              dropTargetId={dropTargetId}
            />
          </div>

          {/* Робоча область */}
          <div
            className={cn(
              "relative min-h-[60vh] min-w-0 space-y-4 rounded-2xl transition-colors",
              uploadOver && "bg-blue-50/60 dark:bg-blue-500/5",
            )}
          >
            {/* Мобільний перемикач */}
            <div className="flex gap-2 lg:hidden">
              <Button
                variant={favoritesView ? "outline" : "default"}
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => openFolder(null)}
              >
                <HardDrive className="h-4 w-4" /> Усі
              </Button>
              <Button
                variant={favoritesView ? "default" : "outline"}
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => setUrl({ view: "favorites", folder: null, file: null })}
              >
                <Star className="h-4 w-4" /> Обране
              </Button>
            </div>

            <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
              <DocBreadcrumbs
                path={currentPath}
                favoritesView={favoritesView}
                searchQuery={query}
                onNavigate={openFolder}
                dndFor={dndFor}
                dropTargetId={dropTargetId}
              />

              {!query && !favoritesView && currentFolder && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 rounded-xl text-muted-foreground"
                    disabled={!!zipProgress}
                    onClick={() => handlers.onDownload({ kind: "folder", item: currentFolder })}
                  >
                    <Download className="h-4 w-4" /> Скачати папку (ZIP)
                  </Button>
                  <DocActionsMenu
                    target={{ kind: "folder", item: currentFolder }}
                    isAdmin={isAdmin}
                    isFavorite={isFavorite(currentFolder.id)}
                    handlers={handlers}
                    hideOpen
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                        <MoreHorizontal className="h-4 w-4" /> Дії з папкою
                      </Button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Панель вибраних */}
            {selectedFiles.length > 0 && (
              <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/95 px-3 py-2 shadow-sm backdrop-blur dark:border-blue-500/30 dark:bg-slate-900/95">
                <span className="mr-auto text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Вибрано: {selectedFiles.length} · {formatDocSize(selectedFiles.reduce((s, f) => s + f.size, 0))}
                </span>
                <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={toggleSelectAll}>
                  {visibleFiles.every((f) => selected.has(f.id)) ? "Зняти всі" : "Вибрати всі"}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  disabled={!!zipProgress}
                  onClick={() =>
                    selectedFiles.length === 1
                      ? downloadFile(selectedFiles[0])
                      : downloadZip(zipEntriesForFiles(selectedFiles), `${currentName} - вибрані`)
                  }
                >
                  <Download className="h-4 w-4" /> {selectedFiles.length === 1 ? "Скачати" : "Скачати ZIP"}
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-xl"
                      onClick={() => setMoveTarget({ kind: "files", files: selectedFiles })}
                    >
                      <FolderInput className="h-4 w-4" /> Перемістити
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-xl text-red-600 hover:text-red-700"
                      onClick={() => setDeleteTarget({ kind: "files", files: selectedFiles })}
                    >
                      <Trash2 className="h-4 w-4" /> Видалити
                    </Button>
                  </>
                )}
                <button
                  type="button"
                  title="Скасувати вибір (Esc)"
                  onClick={() => setSelected(new Set())}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Вміст */}
            {!visibleFolders.length && !visibleFiles.length ? (
              <EmptyState
                kind={query ? "search" : favoritesView ? "favorites" : "folder"}
                isAdmin={isAdmin}
                onUpload={() => fileInputRef.current?.click()}
                onCreateFolder={() => setNameDialog({ mode: "create" })}
                onDeleteFolder={
                  currentFolder && !query && !favoritesView
                    ? () => setDeleteTarget({ kind: "folder", folder: currentFolder })
                    : undefined
                }
              />
            ) : viewMode === "list" ? (
              <DocListTable
                folders={visibleFolders.map((folder) => ({
                  folder,
                  stats: index.totals.get(folder.id),
                  location: showLocation ? shortLocationOf(folder.parentId) : undefined,
                  locationTitle: showLocation ? locationOf(folder.parentId) : undefined,
                }))}
                files={visibleFiles.map((file) => ({
                  file,
                  location: showLocation ? shortLocationOf(file.folderId) : undefined,
                  locationTitle: showLocation ? locationOf(file.folderId) : undefined,
                }))}
                isAdmin={isAdmin}
                isFavorite={isFavorite}
                handlers={handlers}
                dndFor={dndFor}
                dropTargetId={dropTargetId}
                selected={selected}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                showLocation={showLocation}
              />
            ) : (
              <div className="space-y-5">
                {visibleFolders.length > 0 && (
                  <section className="space-y-2">
                    <SectionTitle>Папки · {visibleFolders.length}</SectionTitle>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {visibleFolders.map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          stats={index.totals.get(folder.id)}
                          subfolders={index.childFolders.get(folder.id)?.length ?? 0}
                          isAdmin={isAdmin}
                          isFavorite={isFavorite(folder.id)}
                          handlers={handlers}
                          dnd={dndFor({ kind: "folder", item: folder })}
                          isDropTarget={dropTargetId === folder.id}
                          location={showLocation ? shortLocationOf(folder.parentId) : undefined}
                          locationTitle={showLocation ? locationOf(folder.parentId) : undefined}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {visibleFiles.length > 0 && (
                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <SectionTitle>Файли · {visibleFiles.length}</SectionTitle>
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {visibleFiles.every((f) => selected.has(f.id)) ? "Зняти вибір" : "Вибрати всі"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                      {visibleFiles.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          isAdmin={isAdmin}
                          isFavorite={isFavorite(file.id)}
                          handlers={handlers}
                          dnd={dndFor({ kind: "file", item: file })}
                          selected={selected.has(file.id)}
                          selectionMode={selected.size > 0}
                          onToggleSelect={toggleSelect}
                          location={showLocation ? shortLocationOf(file.folderId) : undefined}
                          locationTitle={showLocation ? locationOf(file.folderId) : undefined}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Не розмонтовуємо під час drag (лише ховаємо) — інакше губиться dragleave і рамка залипає */}
            {isAdmin && (visibleFolders.length > 0 || visibleFiles.length > 0) && (
              <p className={cn("hidden pt-2 text-center text-xs text-muted-foreground lg:block", uploadOver && "invisible")}>
                Перетягніть файли або цілі папки сюди, щоб завантажити в «{uploadTargetName}». Файли й папки можна
                перетягувати на інші папки, щоб перемістити.
              </p>
            )}

            {/* Підказка не перекриває папки — на них теж можна кинути файли */}
            {uploadOver && (
              <div className="pointer-events-none fixed bottom-6 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-blue-600 px-5 py-3 text-white shadow-2xl">
                <UploadCloud className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-semibold">Відпустіть, щоб завантажити в «{dropHintName}»</p>
                  <p className="text-xs text-blue-100">Наведіть на папку, щоб покласти файли саме в неї · структура папок збережеться</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Діалоги */}
      <DocPreviewDialog
        file={previewFile}
        files={previewList}
        location={previewFile ? locationOf(previewFile.folderId) : ""}
        isFavorite={previewFile ? isFavorite(previewFile.id) : false}
        onClose={() => setUrl({ file: null })}
        onNavigate={openFile}
        onDownload={downloadFile}
        onCopyLink={(file) => copyLink({ kind: "file", item: file })}
        onToggleFavorite={(file) => handlers.onToggleFavorite({ kind: "file", item: file })}
      />

      {isAdmin && (
        <>
          <DocNameDialog
            open={!!nameDialog}
            title={
              nameDialog?.mode === "create"
                ? "Нова папка"
                : renameTarget?.kind === "folder"
                  ? "Перейменувати папку"
                  : "Перейменувати файл"
            }
            description={nameDialog?.mode === "create" ? `Буде створена в «${uploadTargetName}»` : undefined}
            initialValue={renameTarget ? renameTarget.item.name : ""}
            selectStemOnly={renameTarget?.kind === "file"}
            submitLabel={nameDialog?.mode === "create" ? "Створити" : "Зберегти"}
            pending={createFolder.isPending || updateFolder.isPending || updateFile.isPending}
            onSubmit={submitName}
            onClose={() => setNameDialog(null)}
          />

          <DocMoveDialog
            open={!!moveTarget}
            title={
              moveTarget?.kind === "folder"
                ? `Перемістити папку «${moveTarget.folder.name}»`
                : moveTarget?.files.length === 1
                  ? `Перемістити «${moveTarget.files[0].name}»`
                  : `Перемістити файли (${moveTarget?.files.length ?? 0})`
            }
            index={index}
            disabledIds={moveDisabledIds}
            // undefined — файли з різних папок: «поточної» немає, корінь теж доступний
            currentParentId={
              moveTarget?.kind === "folder"
                ? moveTarget.folder.parentId
                : moveTarget && moveTarget.files.every((f) => f.folderId === moveTarget.files[0].folderId)
                  ? moveTarget.files[0].folderId
                  : undefined
            }
            pending={updateFolder.isPending || updateFile.isPending}
            onSubmit={submitMove}
            onClose={() => setMoveTarget(null)}
          />

          <DocDeleteDialog
            open={!!deleteTarget}
            title={deleteTarget?.kind === "folder" ? "Видалити папку?" : "Видалити файли?"}
            message={deleteMessage}
            pending={deleteFolder.isPending || deleteFile.isPending}
            onConfirm={confirmDelete}
            onClose={() => setDeleteTarget(null)}
          />
        </>
      )}

      <DocProgressCard upload={uploadState} zip={zipProgress} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</h2>
  );
}

function EmptyState({
  kind, isAdmin, onUpload, onCreateFolder, onDeleteFolder,
}: {
  kind: "search" | "favorites" | "folder";
  isAdmin: boolean;
  onUpload: () => void;
  onCreateFolder: () => void;
  /** Є лише всередині папки (не в корені) */
  onDeleteFolder?: () => void;
}) {
  const content = {
    search: { icon: Search, title: "Нічого не знайдено", text: "Спробуйте іншу назву або частину назви документа" },
    favorites: { icon: Star, title: "В обраному порожньо", text: "Відкрийте меню файлу чи папки й натисніть «Додати в обране» — вони з'являться тут" },
    folder: {
      icon: UploadCloud,
      title: "Папка порожня",
      text: isAdmin ? "Перетягніть сюди файли чи цілі папки з комп'ютера або скористайтесь кнопками нижче" : "Документи ще не додані",
    },
  }[kind];
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-20 text-center dark:border-white/10">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-white/5">
        <Icon className="h-8 w-8" />
      </div>
      <p className="font-semibold">{content.title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{content.text}</p>
      {kind === "folder" && isAdmin && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={onCreateFolder}>
            <FolderPlus className="h-4 w-4" /> Нова папка
          </Button>
          <Button size="sm" className="gap-1.5 rounded-xl" onClick={onUpload}>
            <Upload className="h-4 w-4" /> Завантажити файли
          </Button>
          {onDeleteFolder && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:hover:bg-red-500/10"
              onClick={onDeleteFolder}
            >
              <Trash2 className="h-4 w-4" /> Видалити цю папку
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
