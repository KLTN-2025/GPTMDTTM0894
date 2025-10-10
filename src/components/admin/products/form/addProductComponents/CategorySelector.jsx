import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col } from "react-bootstrap";
import API_CONFIG from "@/config/api";
export default function CategorySelector({ 
    selectedParent, 
    setSelectedParent, 
    selectedChild, 
    setSelectedChild 
  }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(API_CONFIG.getApiUrl("/categories"))
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          console.error("API danh mục trả về dữ liệu không hợp lệ");
        }
      })
      .catch((err) => console.error("Lỗi khi gọi API danh mục:", err));
  }, []);

  // Khi selectedParent thay đổi (từ EditProductPage), reset selectedChild nếu child đang chọn không thuộc parent mới
  useEffect(() => {
    if (selectedParent && selectedChild) {
      const parent = categories.find((cat) => cat.category_id === selectedParent);
      const childExists = parent?.children?.some(child => child.category_id === selectedChild);
      if (!childExists) {
        setSelectedChild(null); // Reset child nếu không thuộc parent hiện tại
      }
    }
  }, [selectedParent, selectedChild, categories, setSelectedChild]);

  const handleParentChange = (e) => {
    const parentId = Number(e.target.value) || null;
    setSelectedParent(parentId);
    setSelectedChild(null); // reset con khi đổi cha
  };

  // Lấy danh mục con từ children của danh mục cha được chọn
  const childCategories = selectedParent
    ? categories.find((cat) => cat.category_id === selectedParent)?.children || []
    : [];

  return (
    <div className="mb-4">
      <Row>
        <Col md={6}>
          <Form.Group controlId="parentCategory" className="mb-3">
            <Form.Label>Thêm danh mục cha</Form.Label>
            <Form.Select value={selectedParent || ''} onChange={handleParentChange}>
              <option value="">-- Chọn danh mục cha --</option>
              {categories
                .filter((cat) => !cat.parent_id) // chỉ hiển thị danh mục cha
                .map((parent) => (
                  <option key={parent.category_id} value={parent.category_id}>
                    {parent.name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="childCategory" className="mb-3">
            <Form.Label>Thêm danh mục con</Form.Label>
            <Form.Select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(Number(e.target.value) || null)}
              disabled={childCategories.length == 0}
            >
              <option value="">-- Chọn danh mục con --</option>
              {childCategories.map((child) => (
                <option key={child.category_id} value={child.category_id}>
                  {child.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
}
