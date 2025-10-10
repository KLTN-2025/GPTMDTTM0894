import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import API_CONFIG from "@/config/api";

export default function CategorySelector({
  selectedParent,
  setSelectedParent,
  selectedChild,
  setSelectedChild,
  initialParent,
  initialChild,
}) {
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // Load danh mục cha khi mount
  useEffect(() => {
    async function fetchParents() {
      setLoadingParents(true);
      try {
        const res = await axios.get(API_CONFIG.getApiUrl("/categories"));
        const parents = res.data.filter(c => c.parent_id === null);
        setParentCategories(parents);
      } catch (error) {
        console.error("❌ Lỗi load danh mục cha:", error);
      } finally {
        setLoadingParents(false);
      }
    }
    fetchParents();
  }, []);

  useEffect(() => {
    if (initialChild && !selectedChild) {
      setSelectedChild(initialChild);
      console.log("✅ Gán selectedChild trực tiếp từ initial:", initialChild);
    }
  }, [initialChild, selectedChild]);

  // Set selectedParent từ initialParent (chỉ 1 lần hoặc khi initialParent thay đổi)
  useEffect(() => {
    if (initialParent && initialParent !== selectedParent) {
      setSelectedParent(initialParent);
      console.log("⏳ Gán selectedParent từ initial:", initialParent);
    }
  }, [initialParent]);

  // Load danh mục con khi selectedParent thay đổi
  useEffect(() => {
    async function fetchChildren() {
      if (!selectedParent) {
        setChildCategories([]);
        setSelectedChild(null);
        return;
      }

      setLoadingChildren(true);
      try {
        const res = await axios.get(API_CONFIG.getApiUrl(`/categories/parent/${selectedParent}`));
        setChildCategories(res.data || []);
      } catch (error) {
        console.error("❌ Lỗi load danh mục con:", error);
      } finally {
        setLoadingChildren(false);
      }
    }
    fetchChildren();
  }, [selectedParent]);

  // Set selectedChild từ initialChild (chỉ khi initialChild thay đổi và hợp lệ)
  useEffect(() => {
    if (
      initialChild &&
      initialChild !== selectedChild &&
      childCategories.some(cat => cat.category_id === initialChild)
    ) {
      setSelectedChild(initialChild);
      console.log("⏳ Gán selectedChild từ initial:", initialChild);
    }
  }, [initialChild, childCategories]);

  // Đồng bộ selectedChild với childCategories (reset nếu không hợp lệ)
  useEffect(() => {
    if (selectedChild && !childCategories.some(cat => cat.category_id === selectedChild)) {
      setSelectedChild(null);
      console.log("⚠️ selectedChild không còn hợp lệ, reset về null");
    }
  }, [childCategories, selectedChild]);

  return (
    <>
      <h5 className="mb-3">Chọn danh mục</h5>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Danh mục cha</Form.Label>
            <Form.Select
              value={selectedParent || ""}
              onChange={(e) => {
                const val = e.target.value;
                const parentId = val ? parseInt(val) : null;
                setSelectedParent(parentId);
                setSelectedChild(null);
                console.log("🟢 Chọn danh mục cha:", parentId);
              }}
              disabled={loadingParents}
            >
              <option value="">-- Chọn danh mục cha --</option>
              {parentCategories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Danh mục con</Form.Label>
            <Form.Select
              value={selectedChild || ""}
              onChange={(e) => {
                const val = e.target.value;
                const childId = val ? parseInt(val) : null;
                setSelectedChild(childId);
                console.log("🟢 Chọn danh mục con:", childId);
              }}
              disabled={!selectedParent || loadingChildren}
            >
              <option value="">-- Chọn danh mục con --</option>
              {childCategories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {(loadingParents || loadingChildren) && (
        <div className="mt-2 text-muted d-flex align-items-center gap-2">
          <Spinner size="sm" animation="border" />
          Đang tải danh mục...
        </div>
      )}
    </>
  );
}
