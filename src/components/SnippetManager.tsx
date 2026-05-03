"use client";

import { useState } from "react";
import { Copy, Check, Terminal, FileCode, Plus } from "lucide-react";

type Snippet = {
  id: string;
  title: string;
  content: string;
  type: "path" | "command";
};

const INITIAL_SNIPPETS: Snippet[] = [
  { id: "1", title: "DB Config", content: "src/config/database.ts", type: "path" },
  { id: "2", title: "Run Migrations", content: "npm run supabase:migration:up", type: "command" },
  { id: "3", title: "Main Layout", content: "src/app/layout.tsx", type: "path" },
];

export function SnippetManager() {
  const [snippets] = useState<Snippet[]>(INITIAL_SNIPPETS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-72 h-full bg-sidebar text-sidebar-foreground border-l border-border flex flex-col shrink-0">
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <h2 className="font-semibold text-sm">Quick Copy</h2>
        <button className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {snippets.map((snippet) => (
          <div 
            key={snippet.id} 
            className="group bg-background border border-border rounded-lg p-3 hover:border-primary transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              {snippet.type === 'path' ? (
                <FileCode size={14} className="text-primary" />
              ) : (
                <Terminal size={14} className="text-primary" />
              )}
              <span className="text-xs font-semibold">{snippet.title}</span>
            </div>
            
            <div className="relative">
              <div className="bg-black/5 dark:bg-white/5 rounded p-2 pr-8 font-mono text-xs overflow-x-auto whitespace-nowrap text-muted-foreground">
                {snippet.content}
              </div>
              <button 
                onClick={() => handleCopy(snippet.id, snippet.content)}
                className="absolute right-1 top-1 bottom-1 px-2 flex items-center justify-center bg-background rounded shadow-sm border border-border hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Copy to clipboard"
              >
                {copiedId === snippet.id ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-muted" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
