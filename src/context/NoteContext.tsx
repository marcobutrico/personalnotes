"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ItemType = "folder" | "note";

export interface NotebookItem {
  id: string;
  title: string;
  type: ItemType;
  parentId: string | null;
  content?: string;
}

interface NoteContextType {
  items: NotebookItem[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  addItem: (parentId: string | null, type: ItemType, title: string) => void;
  deleteItem: (id: string) => void;
  updateNoteContent: (id: string, content: string) => void;
  updateItemTitle: (id: string, title: string) => void;
  duplicateItem: (id: string) => void;
}

const defaultItems: NotebookItem[] = [
  { id: "1", title: "Getting Started", type: "note", parentId: null, content: "<h1>Welcome!</h1><p>This is your personal code notebook.</p>" },
];

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("notebook_items");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(JSON.parse(saved));
    } else {

      setItems(defaultItems);
    }
    
    const savedActiveId = localStorage.getItem("notebook_active_note");
    if (savedActiveId) {

      setActiveNoteId(savedActiveId);
    } else {

      setActiveNoteId("1");
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("notebook_items", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (isLoaded && activeNoteId) {
      localStorage.setItem("notebook_active_note", activeNoteId);
    }
  }, [activeNoteId, isLoaded]);

  const addItem = (parentId: string | null, type: ItemType, title: string) => {
    const newItem: NotebookItem = {
      id: Date.now().toString(),
      title,
      type,
      parentId,
      content: type === "note" ? "" : undefined,
    };
    setItems((prev) => [...prev, newItem]);
    if (type === "note") {
      setActiveNoteId(newItem.id);
    }
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      // Recursive delete to remove children
      const toDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        prev.forEach((item) => {
          if (item.parentId && toDelete.has(item.parentId) && !toDelete.has(item.id)) {
            toDelete.add(item.id);
            changed = true;
          }
        });
      }
      return prev.filter((item) => !toDelete.has(item.id));
    });
    
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const updateNoteContent = (id: string, content: string) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, content } : item));
  };

  const updateItemTitle = (id: string, title: string) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, title } : item));
  };

  const duplicateItem = (id: string) => {
    setItems((prev) => {
      const itemToDuplicate = prev.find((item) => item.id === id);
      if (!itemToDuplicate) return prev;

      const newId = Date.now().toString();
      const newItem: NotebookItem = {
        ...itemToDuplicate,
        id: newId,
        title: `${itemToDuplicate.title} (Copy)`,
      };

      if (newItem.type === "note") {
        setActiveNoteId(newId);
      }

      return [...prev, newItem];
    });
  };

  return (
    <NoteContext.Provider value={{
      items,
      activeNoteId,
      setActiveNoteId,
      addItem,
      deleteItem,
      updateNoteContent,
      updateItemTitle,
      duplicateItem
    }}>
      {children}
    </NoteContext.Provider>
  );
}

export function useNotebook() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error("useNotebook must be used within a NoteProvider");
  }
  return context;
}
