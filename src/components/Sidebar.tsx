"use client";

import { useState, useEffect } from "react";
import { Folder, FileText, ChevronDown, Plus, Settings, Trash2, Edit2, ChevronRight, MoreVertical, Copy, Link } from "lucide-react";
import { useNotebook, NotebookItem, ItemType } from "@/context/NoteContext";

type ContextMenuState = {
  x: number;
  y: number;
  itemId: string | null; // null means root area
} | null;

export function Sidebar() {
  const { items, addItem, deleteItem, updateItemTitle, duplicateItem } = useNotebook();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // Root level items
  const rootItems = items.filter(item => item.parentId === null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, itemId: string | null) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemId
    });
  };

  const handleAdd = (parentId: string | null, type: ItemType) => {
    const title = prompt(`Enter ${type} name:`);
    if (title) addItem(parentId, type, title);
    setContextMenu(null);
  };

  const handleEdit = (item: NotebookItem) => {
    const title = prompt("Enter new name:", item.title);
    if (title) updateItemTitle(item.id, title);
    setContextMenu(null);
  };

  const handleDelete = (item: NotebookItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteItem(item.id);
    }
    setContextMenu(null);
  };

  return (
    <div 
      className="w-64 h-full bg-sidebar text-sidebar-foreground border-r border-border flex flex-col shrink-0 relative"
      onContextMenu={(e) => {
        // Only trigger root context menu if we click on the empty space of the sidebar
        if (e.target === e.currentTarget) {
          handleContextMenu(e, null);
        }
      }}
    >
      {/* Workspace Header */}
      <div className="h-14 border-b border-border flex items-center px-4 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs mr-2">
          M
        </div>
        <span className="font-semibold text-sm flex-1">Marco&apos;s Workspace</span>
        <ChevronDown size={16} className="text-muted" />
      </div>

      {/* Navigation */}
      <div 
        className="flex-1 overflow-y-auto py-4 px-2 space-y-1"
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) handleContextMenu(e, null);
        }}
      >
        
        <div className="text-xs font-semibold text-muted mt-2 mb-2 px-2 uppercase tracking-wider flex items-center justify-between group">
          <span>My Notes</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button title="Add File" onClick={() => handleAdd(null, "note")} className="hover:text-foreground">
              <Plus size={14} className="cursor-pointer" />
            </button>
            <button title="Add Folder" onClick={() => handleAdd(null, "folder")} className="hover:text-foreground ml-1">
              <Folder size={14} className="cursor-pointer" />
            </button>
          </div>
        </div>
        
        {rootItems.map(item => (
          <SidebarNode 
            key={item.id} 
            item={item} 
            allItems={items} 
            onContextMenu={(e) => handleContextMenu(e, item.id)}
          />
        ))}

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted hover:text-foreground cursor-pointer transition-colors">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 w-48 bg-background border border-border rounded-md shadow-lg py-1 text-sm font-medium"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {(() => {
            const item = contextMenu.itemId ? items.find(i => i.id === contextMenu.itemId) : null;
            
            return (
              <>
                {/* Actions for Root or Folder */}
                {(!item || item.type === "folder") && (
                  <>
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                      onClick={() => handleAdd(item ? item.id : null, "note")}
                    >
                      <FileText size={14} className="text-muted" /> New Note
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                      onClick={() => handleAdd(item ? item.id : null, "folder")}
                    >
                      <Folder size={14} className="text-muted" /> New Folder
                    </button>
                  </>
                )}
                
                {/* Actions for existing item */}
                {item && (
                  <>
                    {item.type === "folder" && <div className="h-px bg-border my-1 mx-2"></div>}
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 size={14} className="text-muted" /> Rename
                    </button>
                    
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                      onClick={() => {
                        duplicateItem(item.id);
                        setContextMenu(null);
                      }}
                    >
                      <Copy size={14} className="text-muted" /> Duplicate
                    </button>

                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                      onClick={() => {
                        navigator.clipboard.writeText(item.title);
                        setContextMenu(null);
                      }}
                    >
                      <Link size={14} className="text-muted" /> Copy Title
                    </button>

                    <div className="h-px bg-border my-1 mx-2"></div>

                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function SidebarNode({ 
  item, 
  allItems,
  onContextMenu
}: { 
  item: NotebookItem; 
  allItems: NotebookItem[];
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const { activeNoteId, setActiveNoteId } = useNotebook();
  const [expanded, setExpanded] = useState(true);

  const children = allItems.filter(i => i.parentId === item.id);
  const isActive = activeNoteId === item.id;

  return (
    <div>
      <div 
        onClick={() => {
          if (item.type === "note") setActiveNoteId(item.id);
          else setExpanded(!expanded);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          onContextMenu(e);
        }}
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${isActive ? 'bg-black/10 dark:bg-white/10 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-foreground'}`}
      >
        <span className="text-muted flex items-center">
          {item.type === "folder" ? (
            expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <FileText size={16} className="ml-1" />
          )}
        </span>
        <span className="flex-1 truncate">{item.title}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
          <MoreVertical size={14} className="text-muted hover:text-foreground" onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }} />
        </div>
      </div>
      
      {item.type === "folder" && expanded && children.length > 0 && (
        <div className="ml-4 border-l border-border pl-2 mt-1 space-y-1">
          {children.map(child => (
            <SidebarNode 
              key={child.id} 
              item={child} 
              allItems={allItems} 
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}
