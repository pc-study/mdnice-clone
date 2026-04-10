import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
  createdAt: number;
  updatedAt: number;
  parentId: string | null;
}

interface FileState {
  files: FileItem[];
  activeFileId: string | null;
  sidebarVisible: boolean;
  setFiles: (files: FileItem[]) => void;
  setActiveFileId: (id: string | null) => void;
  setSidebarVisible: (visible: boolean) => void;
  addFile: (name: string, parentId: string | null) => FileItem;
  addFolder: (name: string, parentId: string | null) => FileItem;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  updateFileContent: (id: string, content: string) => void;
  moveFile: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

const DEFAULT_FILES: FileItem[] = [
  {
    id: 'default-file',
    name: '欢迎使用.md',
    type: 'file',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    parentId: null,
  },
];

function loadFiles(): FileItem[] {
  try {
    const data = localStorage.getItem('mdnice-files');
    return data ? JSON.parse(data) : DEFAULT_FILES;
  } catch {
    return DEFAULT_FILES;
  }
}

function saveFiles(files: FileItem[]) {
  localStorage.setItem('mdnice-files', JSON.stringify(files));
}

function findAndRemove(files: FileItem[], id: string): FileItem[] {
  return files.filter((f) => {
    if (f.id === id) return false;
    if (f.children) f.children = findAndRemove(f.children, id);
    return true;
  });
}

function findAndUpdate(files: FileItem[], id: string, updater: (f: FileItem) => FileItem): FileItem[] {
  return files.map((f) => {
    if (f.id === id) return updater(f);
    if (f.children) return { ...f, children: findAndUpdate(f.children, id, updater) };
    return f;
  });
}

function addToParent(files: FileItem[], parentId: string | null, item: FileItem): FileItem[] {
  if (!parentId) return [...files, item];
  return files.map((f) => {
    if (f.id === parentId && f.type === 'folder') {
      return { ...f, children: [...(f.children || []), item] };
    }
    if (f.children) return { ...f, children: addToParent(f.children, parentId, item) };
    return f;
  });
}

function findItem(files: FileItem[], id: string): FileItem | null {
  for (const f of files) {
    if (f.id === id) return f;
    if (f.children) {
      const found = findItem(f.children, id);
      if (found) return found;
    }
  }
  return null;
}

function insertAt(files: FileItem[], targetId: string, item: FileItem, position: 'before' | 'after'): FileItem[] {
  const result: FileItem[] = [];
  for (const f of files) {
    if (f.id === targetId) {
      if (position === 'before') { result.push(item); result.push(f); }
      else { result.push(f); result.push(item); }
    } else {
      if (f.children) {
        result.push({ ...f, children: insertAt(f.children, targetId, item, position) });
      } else {
        result.push(f);
      }
    }
  }
  return result;
}

function addInside(files: FileItem[], targetId: string, item: FileItem): FileItem[] {
  return files.map((f) => {
    if (f.id === targetId && f.type === 'folder') {
      return { ...f, children: [...(f.children || []), item] };
    }
    if (f.children) return { ...f, children: addInside(f.children, targetId, item) };
    return f;
  });
}

export const useFileStore = create<FileState>((set, get) => ({
  files: loadFiles(),
  activeFileId: localStorage.getItem('mdnice-activeFileId') || 'default-file',
  sidebarVisible: true,
  setFiles: (files) => { saveFiles(files); set({ files }); },
  setActiveFileId: (activeFileId) => {
    if (activeFileId) localStorage.setItem('mdnice-activeFileId', activeFileId);
    set({ activeFileId });
  },
  setSidebarVisible: (sidebarVisible) => set({ sidebarVisible }),
  addFile: (name, parentId) => {
    const item: FileItem = {
      id: uuidv4(), name, type: 'file', content: '# ' + name.replace('.md', '') + '\n\n开始编写...\n',
      createdAt: Date.now(), updatedAt: Date.now(), parentId,
    };
    const files = addToParent(get().files, parentId, item);
    saveFiles(files);
    set({ files });
    return item;
  },
  addFolder: (name, parentId) => {
    const item: FileItem = {
      id: uuidv4(), name, type: 'folder', children: [],
      createdAt: Date.now(), updatedAt: Date.now(), parentId,
    };
    const files = addToParent(get().files, parentId, item);
    saveFiles(files);
    set({ files });
    return item;
  },
  deleteFile: (id) => {
    const files = findAndRemove(get().files, id);
    saveFiles(files);
    const state: Partial<FileState> = { files };
    if (get().activeFileId === id) state.activeFileId = null;
    set(state as FileState);
  },
  renameFile: (id, name) => {
    const files = findAndUpdate(get().files, id, (f) => ({ ...f, name, updatedAt: Date.now() }));
    saveFiles(files);
    set({ files });
  },
  updateFileContent: (id, content) => {
    const files = findAndUpdate(get().files, id, (f) => ({ ...f, content, updatedAt: Date.now() }));
    saveFiles(files);
    set({ files });
  },
  moveFile: (dragId, targetId, position) => {
    if (dragId === targetId) return;
    const item = findItem(get().files, dragId);
    if (!item) return;
    // Remove dragged item first
    let files = findAndRemove(get().files, dragId);
    // Insert at new position
    if (position === 'inside') {
      files = addInside(files, targetId, item);
    } else {
      files = insertAt(files, targetId, item, position);
    }
    saveFiles(files);
    set({ files });
  },
}));
