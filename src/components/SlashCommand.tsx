import { Extension, Editor as CoreEditor, Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Heading1, Heading2, Code, CheckSquare } from 'lucide-react';

export interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: ({ editor, range }: { editor: CoreEditor; range: Range }) => void;
}

const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  return [
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: { editor: CoreEditor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: { editor: CoreEditor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: <Code size={18} />,
      command: ({ editor, range }: { editor: CoreEditor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
    },
    {
      title: 'To-do List',
      description: 'Track tasks with a to-do list.',
      icon: <CheckSquare size={18} />,
      command: ({ editor, range }: { editor: CoreEditor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  return (
    <div className="bg-background border border-border shadow-lg rounded-md overflow-hidden min-w-[280px]">
      {props.items.length > 0 ? (
        props.items.map((item: CommandItem, index: number) => (
          <button
            key={index}
            className={`flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
              index === selectedIndex ? 'bg-black/5 dark:bg-white/5' : 'bg-transparent'
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded border border-border bg-sidebar text-foreground shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{item.title}</span>
              <span className="text-xs text-muted">{item.description}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-muted">No results found.</div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: getSuggestionItems,
        render: () => {
          let component: ReactRenderer<any>;
          let popup: TippyInstance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return component.ref?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
