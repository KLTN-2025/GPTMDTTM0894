import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Toolbar from '../../../helper/react-quill_fix';
import { useEffect } from 'react';

export default function DescriptionEditor({ description, setDescription }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
      }),
    ],
    content: description || '<p></p>',
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
    autofocus: true,
    editable: true,
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="mb-4">
      <label className="form-label fw-bold">Mô tả sản phẩm</label>
      <div className="border rounded p-2 bg-white">
        {editor && <Toolbar editor={editor} />}
        <EditorContent
          editor={editor}
          style={{
            minHeight: '300px',
            maxHeight: '600px',
            overflowY: 'auto',
            resize: 'both',
            border: '1px solid #ccc',
            padding: '12px',
            borderRadius: '8px',
          }}
        />
      </div>
    </div>
  );
}