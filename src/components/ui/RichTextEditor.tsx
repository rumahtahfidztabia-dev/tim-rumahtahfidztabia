"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Upload, Download } from 'lucide-react';
import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-3 focus:outline-none min-h-[150px] max-w-none text-slate-800',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleImportMarkdown = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (editor) {
        editor.commands.setContent(content);
      }
    };
    reader.readAsText(file);
    
    // reset input
    event.target.value = '';
  };

  const handleExportMarkdown = () => {
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markdown = (editor.storage as any).markdown.getMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brief.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-slate-300 rounded-md overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <input
          type="file"
          accept=".md"
          ref={fileInputRef}
          onChange={handleImportMarkdown}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 flex items-center gap-1 text-sm font-medium"
          title="Import from Markdown file"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import .md</span>
        </button>
        <button
          type="button"
          onClick={handleExportMarkdown}
          className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 flex items-center gap-1 text-sm font-medium"
          title="Export to Markdown file"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export .md</span>
        </button>
      </div>
      
      <div className="max-h-[40vh] overflow-y-auto relative">
        <EditorContent editor={editor} />
        {!editor.getText() && placeholder && (
          <div className="absolute top-3 left-3 text-slate-400 pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
