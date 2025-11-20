import { useState } from "react";
import { MDXEditor, headingsPlugin } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export default function MDXEditorIsland({ initialContent = "" }) {
  const [content, setContent] = useState(initialContent);
  const [editorMode, setEditorMode] = useState(true); // start in editor mode

  return (
    <div style={{ marginBottom: "16px" }}>
      <button
        style={{
          marginBottom: "12px",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #aaa",
          cursor: "pointer",
          backgroundColor: editorMode ? "#c8e6c9" : "#f5f5f5",
        }}
        onClick={() => setEditorMode(!editorMode)}
      >
        {editorMode ? "View Mode" : "Editor Mode"}
      </button>

      <div>
        {editorMode ? (
          <MDXEditor
            markdown={content}
            onChange={setContent}
            plugins={[headingsPlugin()]}
            height={500}
            style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px" }}
          />
        ) : (
          <div
            style={{
              lineHeight: 1.7,
              fontSize: "1.05rem",
              background: "#ffffff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* render raw MDX as HTML */}
            <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
