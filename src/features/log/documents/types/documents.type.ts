export interface IDocFolder {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface IDocFile {
  id: string;
  folderId: string | null;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface IDocumentsTree {
  folders: IDocFolder[];
  files: IDocFile[];
}

/** Файл для завантаження + відносний шлях («Папка/Підпапка/файл.pdf»). */
export interface IUploadItem {
  file: File;
  path: string;
}

export interface IUploadResult {
  files: IDocFile[];
  createdFolders: number;
}

export type DocSortKey = "name" | "date" | "size";
export type DocViewMode = "grid" | "list";

/** Елемент, над яким виконується дія (меню, діалоги). */
export type DocTarget =
  | { kind: "folder"; item: IDocFolder }
  | { kind: "file"; item: IDocFile };
