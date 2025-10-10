import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CustomImage from '@/components/admin/helper/CustomImage';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Toolbar from '../../../helper/react-quill_fix';
import { useEffect } from 'react';

export default function DescriptionEditor({ description, setDescription }) {

  // const base64Img =
  // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='; // 1x1 px PNG trắng

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({ inline: false }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content:  description || '<p></p>',
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
    autofocus: true,
    editable: true,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && description !== editor.getHTML()) {
      editor.commands.setContent(description || '<p></p>');
    }
  }, [editor, description]);

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
            backgroundColor: '#f0f0f0', // test màu
          }}
        />
      </div>
    </div>
  );
}
