"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AddProductModal from "./form/addProduct";
import EditProductModal from "./form/updateProduct";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Row, Col } from "react-bootstrap";

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy các param từ URL
  const pageQuery = searchParams.get("page");
  const page = pageQuery ? parseInt(pageQuery) : 1;
  const searchKeyword = searchParams.get("search") || "";
  const selectedParentCategory = searchParams.get("parentCategory") || "";
  const selectedChildCategory = searchParams.get("childCategory") || "";
  const selectedStatus = searchParams.get("status") || "";
  const selectedPrimary = searchParams.get("primary") || "";
  const id = searchParams.get("id");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load child categories khi parent thay đổi
  useEffect(() => {
    if (selectedParentCategory) {
      const parent = categories.find(
        (cat) => cat.category_id === parseInt(selectedParentCategory)
      );

      if (parent && parent.children && parent.children.length > 0) {
        setChildCategories(parent.children);
      } else {
        setChildCategories([]);
      }
    } else {
      setChildCategories([]);
    }
  }, [selectedParentCategory, categories]);

  // Load products khi các param thay đổi (page, search, filters)
  useEffect(() => {
    fetchProducts();
  }, [page, searchKeyword, selectedParentCategory, selectedChildCategory, selectedStatus, selectedPrimary]);

  // Lấy product chi tiết nếu có id
  useEffect(() => {
    if (!id) {
      setSelectedProduct(null);
      setShowEditModal(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/admin/${id}`);
        setSelectedProduct(res.data);
        setShowEditModal(true);
      } catch {
        router.push("/admin/products");
      }
    };
    fetchProduct();
  }, [id]);

  // Hàm fetch products từ API với params lọc
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        params: {
          page,
          limit: 7,
          search: searchKeyword,
          parent_id: selectedParentCategory || undefined,
          category_id: selectedChildCategory || undefined,
          status: selectedStatus || undefined,
          primary: selectedPrimary || undefined,
        },
      });

      setProducts(res.data.products || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");

      const parents = res.data; // cây danh mục cha → children nằm bên trong
      setCategories(parents);
      setParentCategories(parents);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
    }
  };


  // Hàm chuyển trang, đồng thời cập nhật URL params
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/products?${params.toString()}`);
  };

  // Xử lý thay đổi input lọc, cập nhật URL params
  const handleSearchChange = (e) => {
    updateUrlParams({ search: e.target.value, page: 1 }); // reset page về 1 khi search
  };
  const handleParentCategoryChange = (e) => {
    updateUrlParams({ parentCategory: e.target.value, childCategory: "", page: 1 });
  };
  const handleChildCategoryChange = (e) => {
    updateUrlParams({ childCategory: e.target.value, page: 1 });
  };
  const handleStatusChange = (e) => {
    updateUrlParams({ status: e.target.value, page: 1 });
  };
  const handlePrimaryChange = (e) => {
    updateUrlParams({ primary: e.target.value, page: 1 });
  };

  // Hàm chuyển trang
  const goToPage = (pageNum) => {
    updateUrlParams({ page: pageNum });
  };

  // Xử lý toggle primary
  const togglePrimary = async (productId, currentPrimary) => {
    try {
      await axios.patch(`http://localhost:5000/api/products/${productId}/toggle-primary`, {
        products_primary: !currentPrimary,
      });
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi cập nhật ghim:", err);
    }
  };

  const getStatusText = (status) => {
    switch (Number(status)) {
      case 1:
        return <span className="badge bg-warning">Chờ duyệt</span>;
      case 2:
        return <span className="badge bg-success">Hiển thị</span>;
      case 3:
        return <span className="badge bg-secondary">Bị ẩn</span>;
      case 4:
        return <span className="badge" style={{ backgroundColor: "#d0bfff", color: "#4b0082" }}>Sắp ra mắt</span>;
      default:
        return <span className="badge bg-info">Không xác định</span>;
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách sản phẩm</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Thêm sản phẩm
        </button>
      </div>

      {/* Bộ lọc */}
      <Row className="mb-3" style={{ gap: "10px" }}>
        <Col md={2}>
          <Form.Control
            placeholder="Tìm sản phẩm..."
            value={searchKeyword}
            onChange={handleSearchChange}
          />
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedParentCategory}
            onChange={handleParentCategoryChange}
          >
            <option value="">Danh mục cha</option>
            {parentCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedChildCategory}
            onChange={handleChildCategoryChange}
            disabled={!childCategories.length}
          >
            <option value="">Danh mục con</option>
            {childCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedStatus}
            onChange={handleStatusChange}
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Trạng thái</option>
            <option value="1">Chờ duyệt</option>
            <option value="2">Hiển thị</option>
            <option value="3">Đã ẩn</option>
            <option value="4">Hàng sắp về</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedPrimary}
            onChange={handlePrimaryChange}
            aria-label="Lọc theo ghim"
          >
            <option value="">-- Lọc theo ghim --</option>
            <option value="true">Đã ghim</option>
            <option value="false">Chưa ghim</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : (
        <>
          <table className="table table-bordered table-hover mt-3">
            <thead className="table-secondary">
              <tr>
                <th>Tên sản phẩm</th>
                <th>Hình ảnh</th>
                <th>Giá thị trường</th>
                <th>Giá bán</th>
                <th>Ghim</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const marketPrice = product.market_price || 0;
                    const salePrice = product.sale_price || 0;
                    return (
                      <tr key={product.products_id}>
                        <td>{product.products_name}</td>
                        <td>
                          <img
                            src={
                              product.main_image_url
                                ? `http://localhost:5000${product.main_image_url}`
                                : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                            }
                            alt="ảnh sản phẩm"
                            width="80"
                            height="80"
                            style={{ objectFit: "cover" }}
                          />
                        </td>
                        <td>{marketPrice.toLocaleString("vi-VN")} ₫</td>
                        <td>{salePrice.toLocaleString("vi-VN")} ₫</td>
                        <td>
                          {product.products_primary ? (
                            <span className="badge bg-success">Đã ghim</span>
                          ) : (
                            <span className="badge bg-secondary">Chưa ghim</span>
                          )}
                        </td>
                        <td>{getStatusText(product.products_status)}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.set("id", product.products_id);
                              router.push(`/admin/products?${params.toString()}`);
                            }}
                          >
                            Xem
                          </button>
                          {![1, 3].includes(product.products_status) && (
                            <button
                              className={`btn btn-sm ${
                                product.products_primary ? "btn-warning" : "btn-success"
                              }`}
                              onClick={() => togglePrimary(product.products_id, product.products_primary)}
                            >
                              {product.products_primary ? "Bỏ ghim" : "Ghim"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
          </table>

          {/* Pagination */}
          <nav aria-label="Page navigation example" className="mt-3">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(page - 1)} disabled={page === 1}>
                  Trang trước
                </button>
              </li>

              {pageNumbers.map((pageNum) => (
                <li
                  key={pageNum}
                  className={`page-item ${pageNum === page ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => goToPage(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              ))}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
                  Trang sau
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      {/* Modal thêm */}
      <AddProductModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={() => fetchProducts()}
      />

      {/* Modal sửa */}
      {selectedProduct && (
        <EditProductModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          productData={selectedProduct}
          onUpdate={() => fetchProducts()}
        />
      )}
    </div>
  );
}
