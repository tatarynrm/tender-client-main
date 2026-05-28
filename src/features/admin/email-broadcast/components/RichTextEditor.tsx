import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Напишіть текст повідомлення...",
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync internal contenteditable with external value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, value: string = "") => {
    if (disabled) return;
    document.execCommand(command, false, value);
    handleInput();
  };

  const addLink = () => {
    if (disabled) return;
    const url = prompt("Введіть URL посилання:");
    if (url) {
      execCmd("createLink", url);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all flex flex-col min-h-[300px]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Жирний"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Курсив"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Підкреслений"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => execCmd("justifyLeft")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="По лівому краю"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyCenter")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="По центру"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyRight")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="По правому краю"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Маркований список"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Нумерований список"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h2")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center min-w-[28px]"
          title="Заголовок 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h3")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center min-w-[28px]"
          title="Заголовок 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "p")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center min-w-[28px]"
          title="Звичайний текст"
        >
          P
        </button>

        <div className="w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

        <button
          type="button"
          onClick={addLink}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Додати посилання"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("removeFormat")}
          disabled={disabled}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300 transition-colors"
          title="Очистити форматування"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className="flex-grow p-4 min-h-[250px] outline-none text-slate-800 dark:text-slate-100 text-sm leading-relaxed overflow-y-auto prose dark:prose-invert max-w-none focus:ring-0"
        style={{
          minHeight: "250px",
        }}
      />
    </div>
  );
}
