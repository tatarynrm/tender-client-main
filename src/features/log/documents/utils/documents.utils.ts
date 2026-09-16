import { AxiosError } from "axios";
import {
  File as FileIcon,
  FileArchive,
  FileImage,
  FileKey,
  FileSpreadsheet,
  FileText,
  LucideIcon,
  Presentation,
} from "lucide-react";
import {
  DocSortKey,
  IDocFile,
  IDocFolder,
  IDocumentsTree,
  IUploadItem,
} from "../types/documents.type";

// ---------- обмеження (як на бекенді, documents.constants.ts) ----------

export const DOC_MAX_FILE_SIZE = 200 * 1024 * 1024;
export const DOC_UPLOAD_BATCH = 50;

export const DOC_ALLOWED_EXT = new Set([
  ".pdf", ".doc", ".docx", ".rtf", ".odt", ".txt",
  ".xls", ".xlsx", ".ods", ".csv",
  ".ppt", ".pptx",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".heic",
  ".p7s", ".asice", ".sig", ".xml", ".eml", ".msg",
]);

/** Службові файли ОС, які мовчки пропускаємо при перетягуванні папок. */
const SYSTEM_FILES = new Set(["thumbs.db", ".ds_store", "desktop.ini"]);

export const getExt = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
};

// ---------- підтвердження видалення (як isDeleteConfirmed на бекенді) ----------

export const DELETE_CONFIRM_WORD = "ICT";

// На українській розкладці «ІСТ» набирається кирилицею й виглядає так само.
const CYRILLIC_LOOKALIKES: Record<string, string> = { "І": "I", "С": "C", "Т": "T" };

export const isDeleteConfirmed = (value: string) =>
  [...value.trim().toUpperCase()].map((ch) => CYRILLIC_LOOKALIKES[ch] ?? ch).join("") ===
  DELETE_CONFIRM_WORD;

// ---------- тип файлу ----------

export type DocPreviewKind = "pdf" | "image" | "text" | "none";

interface DocTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Класи для плитки іконки */
  tone: string;
  preview: DocPreviewKind;
}

const TYPE_META: Record<string, DocTypeMeta> = {
  pdf: { label: "PDF", icon: FileText, tone: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400", preview: "pdf" },
  word: { label: "Word", icon: FileText, tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", preview: "none" },
  excel: { label: "Excel", icon: FileSpreadsheet, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", preview: "none" },
  ppt: { label: "Презентація", icon: Presentation, tone: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400", preview: "none" },
  archive: { label: "Архів", icon: FileArchive, tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", preview: "none" },
  image: { label: "Зображення", icon: FileImage, tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400", preview: "image" },
  imageRaw: { label: "Зображення", icon: FileImage, tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400", preview: "none" },
  sign: { label: "Підпис / КЕП", icon: FileKey, tone: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400", preview: "none" },
  text: { label: "Текст", icon: FileText, tone: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300", preview: "text" },
  other: { label: "Файл", icon: FileIcon, tone: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300", preview: "none" },
};

const EXT_TYPE: Record<string, keyof typeof TYPE_META> = {
  ".pdf": "pdf",
  ".doc": "word", ".docx": "word", ".rtf": "word", ".odt": "word",
  ".xls": "excel", ".xlsx": "excel", ".ods": "excel", ".csv": "excel",
  ".ppt": "ppt", ".pptx": "ppt",
  ".zip": "archive", ".rar": "archive", ".7z": "archive", ".tar": "archive", ".gz": "archive",
  ".jpg": "image", ".jpeg": "image", ".png": "image", ".gif": "image", ".webp": "image", ".bmp": "image",
  ".tif": "imageRaw", ".tiff": "imageRaw", ".heic": "imageRaw",
  ".p7s": "sign", ".asice": "sign", ".sig": "sign",
  ".txt": "text",
};

export const getDocTypeMeta = (name: string): DocTypeMeta =>
  TYPE_META[EXT_TYPE[getExt(name)] ?? "other"];

// ---------- форматування ----------

export const formatDocSize = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} ГБ`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} МБ`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${bytes} Б`;
};

export const formatDocDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Зберегти Blob як файл (blob: URL того ж origin, тож атрибут download працює). */
export const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export const docErrorMessage = (error: unknown, fallback: string) => {
  const err = error as AxiosError<{ message?: string | string[] }>;
  if (err.response?.status === 413) return "Файл завеликий (максимум 200 МБ)";
  const message = err.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

// ---------- індекс дерева ----------

export interface DocsIndex {
  foldersById: Map<string, IDocFolder>;
  childFolders: Map<string | null, IDocFolder[]>;
  filesByFolder: Map<string | null, IDocFile[]>;
  /** Кількість файлів і розмір разом із вкладеними папками */
  totals: Map<string, { files: number; size: number }>;
  pathOf: (folderId: string | null) => IDocFolder[];
}

const collator = new Intl.Collator("uk", { numeric: true, sensitivity: "base" });

export const buildDocsIndex = (tree: IDocumentsTree): DocsIndex => {
  const foldersById = new Map(tree.folders.map((f) => [f.id, f]));
  const childFolders = new Map<string | null, IDocFolder[]>();
  const filesByFolder = new Map<string | null, IDocFile[]>();
  const totals = new Map<string, { files: number; size: number }>();

  for (const folder of tree.folders) {
    const list = childFolders.get(folder.parentId) ?? [];
    list.push(folder);
    childFolders.set(folder.parentId, list);
    totals.set(folder.id, { files: 0, size: 0 });
  }
  childFolders.forEach((list) => list.sort((a, b) => collator.compare(a.name, b.name)));

  for (const file of tree.files) {
    const list = filesByFolder.get(file.folderId) ?? [];
    list.push(file);
    filesByFolder.set(file.folderId, list);

    let current = file.folderId;
    let guard = 0;
    while (current && guard++ < 100) {
      const t = totals.get(current);
      if (t) {
        t.files++;
        t.size += file.size;
      }
      current = foldersById.get(current)?.parentId ?? null;
    }
  }

  const pathOf = (folderId: string | null) => {
    const path: IDocFolder[] = [];
    let current = folderId;
    let guard = 0;
    while (current && guard++ < 100) {
      const folder = foldersById.get(current);
      if (!folder) break;
      path.unshift(folder);
      current = folder.parentId;
    }
    return path;
  };

  return { foldersById, childFolders, filesByFolder, totals, pathOf };
};

/** Id папки та всіх вкладених — щоб не дати перемістити папку саму в себе. */
export const collectDescendantIds = (index: DocsIndex, folderId: string) => {
  const ids = new Set<string>([folderId]);
  const stack = [folderId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of index.childFolders.get(id) ?? []) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return ids;
};

export const sortFiles = (files: IDocFile[], key: DocSortKey) =>
  [...files].sort((a, b) => {
    if (key === "date") return b.updatedAt.localeCompare(a.updatedAt);
    if (key === "size") return b.size - a.size;
    return collator.compare(a.name, b.name);
  });

export const sortFolders = (folders: IDocFolder[], key: DocSortKey) =>
  key === "date"
    ? [...folders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    : [...folders].sort((a, b) => collator.compare(a.name, b.name));

export const matchesQuery = (name: string, query: string) =>
  name.toLocaleLowerCase("uk").includes(query.toLocaleLowerCase("uk"));

// ---------- підготовка файлів до завантаження ----------

/**
 * Файли з події drop разом зі структурою папок. Entry треба забрати СИНХРОННО,
 * до першого await — після обробника DataTransfer стає порожнім.
 */
export const collectDroppedItems = async (
  dataTransfer: DataTransfer,
): Promise<{ items: IUploadItem[]; skipped: string[] }> => {
  const entries = Array.from(dataTransfer.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => !!entry);

  if (!entries.length) {
    return {
      items: Array.from(dataTransfer.files).map((file) => ({ file, path: file.name })),
      skipped: [],
    };
  }

  const items: IUploadItem[] = [];
  // Файл без доступу / зниклий під час читання не зриває весь drop — лише пропускається
  const skipped: string[] = [];

  const walk = async (entry: FileSystemEntry, prefix: string): Promise<void> => {
    if (entry.isFile) {
      try {
        const file = await new Promise<File>((resolve, reject) =>
          (entry as FileSystemFileEntry).file(resolve, reject),
        );
        items.push({ file, path: `${prefix}${file.name}` });
      } catch {
        skipped.push(`${prefix}${entry.name}`);
      }
      return;
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // readEntries віддає вміст порціями (по 100 у Chrome) — читаємо до порожньої
      for (;;) {
        let batch: FileSystemEntry[];
        try {
          batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
            reader.readEntries(resolve, reject),
          );
        } catch {
          skipped.push(`${prefix}${entry.name}/`);
          break;
        }
        if (!batch.length) break;
        for (const child of batch) await walk(child, `${prefix}${entry.name}/`);
      }
    }
  };

  for (const entry of entries) await walk(entry, "");
  return { items, skipped };
};

/** Файли з <input webkitdirectory> або звичайного <input multiple>. */
export const itemsFromFileList = (list: FileList): IUploadItem[] =>
  Array.from(list).map((file) => ({
    file,
    path: file.webkitRelativePath || file.name,
  }));

/** Відсіює службові, непідтримувані й завеликі файли. */
export const filterUploadItems = (items: IUploadItem[]) => {
  const accepted: IUploadItem[] = [];
  const unsupported: string[] = [];
  const tooLarge: string[] = [];

  for (const item of items) {
    const name = item.file.name;
    if (SYSTEM_FILES.has(name.toLowerCase()) || name.startsWith("~$")) continue;
    if (!DOC_ALLOWED_EXT.has(getExt(name))) unsupported.push(name);
    else if (item.file.size > DOC_MAX_FILE_SIZE) tooLarge.push(name);
    else accepted.push(item);
  }
  return { accepted, unsupported, tooLarge };
};
