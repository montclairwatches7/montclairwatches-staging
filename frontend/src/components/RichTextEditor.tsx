import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  return (
    <div
      className={`prose-sm bg-white text-black min-h-[200px] border border-outline-variant/30 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary ${className}`}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-[150px]"
      />
      <style>{`
        /* Minimalist tweaks to seamlessly match UI */
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          background: #fafafa;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .ql-editor {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}
