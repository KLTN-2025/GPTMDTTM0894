import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AddCategoryModal({ show, onClose, onSave }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [banner, setBanner] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageError, setImageError] = useState('');
  const [previewImg, setPreviewImg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // <2MB
        setImageError('Ảnh phải có dung lượng ít nhất 2MB');
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
      setPreviewImg('');
    }
  };

  useEffect(() => {
    if (show) {
      axios.get('http://localhost:5000/api/categories')
        .then(res => setCategories(res.data.filter(c => !c.parent_id)))
        .catch(console.error);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageError) {
      toast.error('Vui lòng chọn ảnh hợp lệ trước khi submit!');
      return;
    }

    const form = new FormData();
    form.append('name', name);
    form.append('note', note);
    form.append('parent_id', parentId || '');
    form.append('is_active', isActive);
    form.append('is_primary', isPrimary);
    if (banner) form.append('image', banner);

    try {
      await axios.post('http://localhost:5000/api/categories', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Thêm danh mục thành công!');
      onSave();
      onClose();
      setName(''); setParentId(''); setIsActive(false); setIsPrimary(false); setBanner(null); setPreviewImg(''); setImageError('');
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
            <h5 className="modal-title">Thêm danh mục</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Tên */}
            <div className="mb-3">
              <label className="form-label">Tên danh mục</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            {/* Tiêu đề */}
            <div className="mb-3">
              <label className="form-label">Tiêu đề</label>
              <input type="text" className="form-control" value={note} onChange={e => setNote(e.target.value)}/>
            </div>
            {/* Banner */}
            <div className="mb-3">
              <label className="form-label">Banner ảnh</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
              {imageError && <small className="text-danger">{imageError}</small>}
              {previewImg && (
                <div className="mt-2">
                  <img src={previewImg} alt="Preview" style={{ width: '150px', borderRadius: '5px' }} />
                </div>
              )}
            </div>
            {/* Danh mục cha */}
            <div className="mb-3">
              <label className="form-label">Danh mục cha</label>
              <select className="form-select" value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">-- Không chọn --</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Checkbox */}
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} id="isActiveCheck" />
              <label className="form-check-label" htmlFor="isActiveCheck">Ẩn danh mục</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} id="isPrimaryCheck" />
              <label className="form-check-label" htmlFor="isPrimaryCheck">Ghim trang chủ</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
            <button type="submit" className="btn btn-primary">Thêm danh mục</button>
          </div>
        </form>
      </div>
    </div>
  );
}
