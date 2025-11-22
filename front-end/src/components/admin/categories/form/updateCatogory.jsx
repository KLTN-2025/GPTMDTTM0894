import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function EditCategoryModal({ show, onClose, onSave, category }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [banner, setBanner] = useState(null);
  const [categories, setCategories] = useState([]);
  const [previewImg, setPreviewImg] = useState('');
  const [imageError, setImageError] = useState('');

  const isChild = !!category?.parent_id; // danh mục con

  useEffect(() => {
    if (show) {
      axios.get('http://localhost:5000/api/categories/')
        .then(res => setCategories(res.data.filter(c => !c.parent_id)))
        .catch(console.error);

      if (category) {
        setName(category.name || '');
        setNote(category.note || '');
        setParentId(category.parent_id || '');
        setIsActive(category.is_active || false);
        setIsPrimary(category.is_primary || false);
        setBanner(null);
        setPreviewImg(category.img ? `http://localhost:5000/uploads/${category.img}` : '');
        setImageError('');
      }
    }
  }, [show, category]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // > 2MB
        setImageError('Ảnh phải nhỏ hơn 2MB');
        setBanner(null);
        setPreviewImg('');
      } else {
        setImageError('');
        setBanner(file);
        setPreviewImg(URL.createObjectURL(file));
      }
    } else {
      setImageError('');
      setBanner(null);
      setPreviewImg(category.img ? `http://localhost:5000/uploads/${category.img}` : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageError) {
      toast.error('Vui lòng chọn ảnh hợp lệ');
      return;
    }

    const form = new FormData();
    form.append('name', name);

    if (isChild) {
      form.append('parent_id', parentId || '');
    } else {
      form.append('note', note);
      form.append('parent_id', parentId || '');
      form.append('is_active', isActive);
      form.append('is_primary', isPrimary);
      if (banner) form.append('image', banner);
    }

    try {
      await axios.put(`http://localhost:5000/api/categories/${category.category_id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Cập nhật danh mục thành công!');
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra!';
      toast.error(msg);
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-header">
            <h5 className="modal-title">Chỉnh sửa danh mục</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Tên */}
            <div className="mb-3">
              <label className="form-label">Tên danh mục</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            {!isChild && (
              <>
                <div className="mb-3">
                  <label className="form-label">Tiêu đề danh mục</label>
                  <input type="text" className="form-control" value={note} onChange={e => setNote(e.target.value)} />
                </div>

                {previewImg && (
                  <div className="mb-3">
                    <label className="form-label">Ảnh hiện tại</label>
                    <br />
                    <img src={previewImg} alt="Preview" style={{ width: '150px', borderRadius: '5px' }} />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Banner ảnh (chọn ảnh mới để thay thế)</label>
                  <input type="file" className="form-control" accept="image/*" onChange={onFileChange} />
                  {imageError && <small className="text-danger">{imageError}</small>}
                </div>

                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  <label className="form-check-label">Ẩn danh mục</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} />
                  <label className="form-check-label">Ghim trang chủ</label>
                </div>
              </>
            )}

            {/* Danh mục cha */}
            <div className="mb-3">
              <label className="form-label">Danh mục cha</label>
              <select className="form-select" value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">-- Không chọn --</option>
                {categories.map(cat => (
                  cat.category_id !== category.category_id && (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                  )
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
            <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
