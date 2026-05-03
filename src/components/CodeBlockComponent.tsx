"use client";

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    // Tiptap node content is stored in node.textContent
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <NodeViewWrapper className="relative group">
      <button
        contentEditable={false}
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-sans z-10"
        title="Copy code"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        {copied && <span>Copied!</span>}
      </button>
      
      <pre className="!mt-0 !mb-0">
        <NodeViewContent as={"code" as any} className={`language-${node.attrs.language || 'javascript'}`} />
      </pre>
    </NodeViewWrapper>
  );
};
