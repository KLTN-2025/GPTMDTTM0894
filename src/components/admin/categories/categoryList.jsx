"use client";

import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import AddCategoryModal from './form/addCategory';
import EditCategoryModal from './form/updateCatogory';
import API_CONFIG from "@/config/api";

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get(API_CONFIG.getApiUrl("/categories"));  
    setCategories(res.data);
  };

  const toggleActive = async (id) => {
    await axios.patch(API_CONFIG.getApiUrl(`/categories/${id}/is_active`));
    fetchCategories();
  };

  const togglePrimary = async (id) => {
    await axios.patch(API_CONFIG.getApiUrl(`/categories/${id}/is_primary`));
    fetchCategories();
  };

  const handleCreateSubCategory = async (parentId) => {
    const name = prompt('Nhập tên danh mục con:');
    if (name) {
      await axios.post(API_CONFIG.getApiUrl("/categories"), { name, parent_id: parentId });
      fetchCategories();
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setShowEditModal(true);
  };

  const renderCategoryRow = (category, level = 0) => {
    const indent = '→ '.repeat(level);
    const isExpanded = expanded === category.category_id;

    return (
      <Fragment key={category.category_id}>
        <tr className={level === 0 ? 'table-primary' : 'table-light'}>
          <td>
            <div className="d-flex justify-content-between align-items-center">
              {indent} {category.name}
              {category.children && category.children.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    setExpanded(isExpanded ? null : category.category_id)
                  }
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              )}
            </div>
          </td>
          <td>
            {category.note}
          </td>
          <td>
            {category.img ? (
              <img
                src={`${API_CONFIG.BACKEND_URL}/uploads/${category.img}`}
                alt={category.name}
                style={{ width: '100px', height: 'auto' }}
              />
            ) : '—'}
          </td>
          
          <td>{category.is_active ? 'Ẩn' : 'Hiển thị'}</td>
          <td>{category.is_primary ? 'Đang ghim' : 'Không'}</td>
          <td>
            {/* <button
              className=`btn btn-sm btn-success me-1"
              onClick={() => handleCreateSubCategory(category.category_id)}
            >
              + Thêm danh mục con
            </button> */}
            <button
              className="btn btn-sm btn-warning me-1"
              onClick={() => handleEdit(category)}
            >
              Sửa
            </button>
            <button
              className="btn btn-sm btn-info me-1"
              onClick={() => togglePrimary(category.category_id)}
            >
              {category.is_primary ? 'Bỏ ghim' : 'Ghim'}
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => toggleActive(category.category_id)}
            >
              {category.is_active ? 'Hiển thị' : 'Ẩn'}
            </button>
          </td>
        </tr>

        {/* Đệ quy render children nếu mở rộng */}
        {isExpanded && category.children && category.children.length > 0 &&
          category.children.map((child) => renderCategoryRow(child, level + 1))}
      </Fragment>
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Quản lý danh mục</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        + Thêm danh mục
      </button>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Tên danh mục</th>
            <th>Tiêu đề danh mụch</th>
            <th>Ảnh Banner</th>
            <th>Trạng thái</th>
            <th>Trang chủ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => renderCategoryRow(category))}
        </tbody>
      </table>

      <AddCategoryModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={fetchCategories}
      />

      <EditCategoryModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={fetchCategories}
        category={editCategory}
      />
    </div>
  );
}
