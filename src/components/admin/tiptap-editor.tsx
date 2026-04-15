"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useCallback, useRef, useState } from "react";

/* ─── Toolbar Button ─────────────────────────────── */

function ToolbarBtn({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
        active
          ? "bg-a-accent text-black"
          : "text-muted hover:bg-card-hover hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

/* ─── Toolbar ────────────────────────────────────── */

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      for (const file of files) {
        const formData = new FormData();
        formData.append("files", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            console.error("Upload returned non-JSON");
            continue;
          }

          const data = await res.json();
          if (data.success && data.data.uploaded?.length > 0) {
            const url = data.data.uploaded[0].url;
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
          }
        } catch (err) {
          console.error("Image upload failed:", err);
        }
      }

      e.target.value = "";
    },
    [editor],
  );

  const toggleLink = useCallback(() => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-a-surface px-2 py-1.5 rounded-t-lg">
      {/* Headings */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Titulo (H2)"
      >
        <span className="font-bold text-xs">H2</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Subtitulo (H3)"
      >
        <span className="font-bold text-xs">H3</span>
      </ToolbarBtn>

      <ToolbarSep />

      {/* Inline formatting */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrita"
      >
        <span className="font-bold">B</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Cursiva"
      >
        <span className="italic">I</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Subrayado"
      >
        <span className="underline">U</span>
      </ToolbarBtn>

      <ToolbarSep />

      {/* Lists */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3.5 6V4l1-1M3 10.5h1.5l-1.5 2h2M3 18h1l.5-1 .5 1h1" />
        </svg>
      </ToolbarBtn>

      <ToolbarSep />

      {/* Blockquote */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Cita"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </ToolbarBtn>

      {/* Link */}
      <ToolbarBtn
        onClick={toggleLink}
        active={editor.isActive("link")}
        title="Enlace"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      </ToolbarBtn>

      {/* Image */}
      <ToolbarBtn onClick={addImage} title="Insertar imagen">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      </ToolbarBtn>

      <ToolbarSep />

      {/* Horizontal rule */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Linea horizontal"
      >
        <span className="text-xs font-medium">—</span>
      </ToolbarBtn>

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Link URL popup */}
      {linkOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-lg">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
            placeholder="https://..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-a-accent/50"
            autoFocus
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-md bg-a-accent px-3 py-1.5 text-xs font-medium text-black hover:bg-a-accent-hover"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => { setLinkOpen(false); setLinkUrl(""); }}
            className="rounded-md bg-card-hover px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Editor Component ───────────────────────────── */

interface TiptapEditorProps {
  content?: string;
  onChange: (html: string) => void;
  error?: string;
}

export function TiptapEditor({ content = "", onChange, error }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full mx-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-a-accent underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Escribe el contenido del post...",
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[400px] px-5 py-4 text-sm text-foreground leading-relaxed outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={`relative rounded-lg border ${error ? "border-danger ring-1 ring-danger/20" : "border-border"} bg-card overflow-hidden`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {error && <p className="px-4 py-2 text-xs text-danger border-t border-border">{error}</p>}
    </div>
  );
}
