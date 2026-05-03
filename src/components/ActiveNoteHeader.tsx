"use client";

import { useNotebook } from "@/context/NoteContext";

export function ActiveNoteHeader() {
  const { items, activeNoteId } = useNotebook();
  
  if (!activeNoteId) {
    return <div className="flex-1"></div>;
  }

  const activeNote = items.find(i => i.id === activeNoteId);
  
  // Try to find the path
  let path = activeNote?.title || "";
  let currentId = activeNote?.parentId;
  
  while (currentId) {
    const parent = items.find(i => i.id === currentId);
    if (parent) {
      path = `${parent.title} / ${path}`;
      currentId = parent.parentId;
    } else {
      break;
    }
  }

  return (
    <div className="flex-1">
      <h1 className="text-sm font-medium text-muted">{path}</h1>
    </div>
  );
}
