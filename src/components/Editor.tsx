"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { common, createLowlight } from "lowlight";
import "highlight.js/styles/atom-one-dark.css";
import { useNotebook } from "@/context/NoteContext";
import { SlashCommand } from "./SlashCommand";
import { CodeBlockComponent } from "./CodeBlockComponent";

const lowlight = createLowlight(common);

export function Editor() {
  const { items, activeNoteId, updateNoteContent } = useNotebook();
  
  const activeNote = items.find(i => i.id === activeNoteId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted h-full">
        Select or create a note to start editing.
      </div>
    );
  }

  return (
    <TiptapEditor 
      key={activeNote.id} 
      initialContent={activeNote.content || ""} 
      onChange={(content) => updateNoteContent(activeNote.id, content)} 
    />
  );
}

function TiptapEditor({ initialContent, onChange }: { initialContent: string; onChange: (content: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      SlashCommand,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none w-full max-w-none text-foreground",
      },
    },
  });

  return (
    <div className="w-full pb-32">
      <EditorContent editor={editor} />
    </div>
  );
}
