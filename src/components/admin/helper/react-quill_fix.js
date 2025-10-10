import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export default function TiptapToolbar({ editor }) {
  if (!editor) return null;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <ButtonGroup className="mb-2 flex-wrap gap-1">

      <Button
        variant={editor.isActive('bold') ? 'dark' : 'outline-dark'}
        size="sm"
        title='In đậm'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </Button>

      {/* Italic */}
      <Button
        variant={editor.isActive('italic') ? 'dark' : 'outline-dark'}
        size="sm"
        title='In nghiêng'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </Button>

      {/* Underline */}
      <Button
        variant={editor.isActive('underline') ? 'dark' : 'outline-dark'}
        size="sm"
        title='Gạch chân'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </Button>

      {/* Căn lề trái */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Căn lề trái'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className="bi bi-text-left" /> {/* bạn có thể dùng icon bootstrap */}
      </Button>

      {/* Căn giữa */}
      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Căn giữa'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i className="bi bi-text-center" />
      </Button>

      {/* Căn phải */}
      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Căn phải'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i className="bi bi-text-right" />
      </Button>

      {/* Căn đều */}
      <Button
        variant={editor.isActive({ textAlign: 'justify' }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Căn đều'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i className="bi bi-justify" />
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Heading 1'
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Heading 2'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Heading 3'
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 4 }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Heading 4'
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        H4
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 5 }) ? 'dark' : 'outline-dark'}
        size="sm"
        title='Heading 5'
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
      >
        H5
      </Button>

      <Button
        variant={editor.isActive('bulletList') ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </Button>

      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        Clear
      </Button>

      <Button variant="outline-dark" size="sm" onClick={() => document.getElementById('imageInput').click()}>
        Thêm ảnh
      </Button>
      
      {/* input ẩn để chọn file ảnh */}
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* Ordered List */}
      <Button
        variant={editor.isActive('orderedList') ? 'dark' : 'outline-dark'}
        size="sm"
        title="Danh sách có số thứ tự"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </Button>

      {/* Thêm bảng */}
      <Button
        variant="outline-dark"
        size="sm"
        title="Chèn bảng"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <i className="bi bi-table" /> Bảng
      </Button>

      {/* Xoá bảng */}
      <Button
        variant="outline-danger"
        size="sm"
        title="Xoá bảng"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <i className="bi bi-x-square" /> Xoá bảng
      </Button>

      {/* Thêm liên kết */}
      <Button
        variant="outline-primary"
        size="sm"
        title="Thêm liên kết"
        onClick={() => {
          const url = prompt('Nhập URL liên kết:');
          if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }}
      >
        <i className="bi bi-link-45deg" /> Link
      </Button>

      {/* Gỡ liên kết */}
      <Button
        variant="outline-secondary"
        size="sm"
        title="Gỡ liên kết"
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <i className="bi bi-link-45deg" /> Bỏ link
      </Button>

    </ButtonGroup>
  );
}
