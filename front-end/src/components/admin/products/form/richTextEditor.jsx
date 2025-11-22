// // src/components/admin/products/form/RichTextEditor.jsx
// "use client";

// import React from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";

// export default function RichTextEditor({ value = "", onChange }) {
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content: value,
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       onChange && onChange(html);
//     },
//   });

//   if (!editor) return null;

//   return (
//     <div className="border rounded p-3 min-h-[200px] bg-white">
//       <EditorContent editor={editor} />
//     </div>
//   );
// }
