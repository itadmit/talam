"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo2,
  Redo2,
  Link2,
  Link2Off,
  Code,
  Pilcrow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0",
        active && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-0.5 shrink-0" />;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "התחל לכתוב...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pr-6 [&_ol]:pr-6 [&_blockquote]:border-r-4 [&_blockquote]:border-primary/30 [&_blockquote]:pr-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-2 [&_hr]:my-4 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("הזן כתובת URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn("rounded-lg border border-input bg-background", className)}>
        <div className="h-10 border-b bg-muted/30" />
        <div className="min-h-[300px] p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-3" />
          <div className="h-4 bg-muted rounded w-1/2 mb-3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-colors",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/30">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="ביטול"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="שחזור"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
          title="פסקה"
        >
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="כותרת 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="כותרת 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="כותרת 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="מודגש"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="נטוי"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="קו תחתון"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="קו חוצה"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="קוד"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="ימין"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="מרכז"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="שמאל"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="רשימה"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="רשימה ממוספרת"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="ציטוט"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="קו מפריד"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="קישור"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            }
            title="הסר קישור"
          >
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
