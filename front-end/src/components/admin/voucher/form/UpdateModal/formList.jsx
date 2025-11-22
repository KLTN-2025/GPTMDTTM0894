import React from 'react';
import { Row, Col, Form, Table, Pagination } from 'react-bootstrap';
 
export default function FormList({
  categories,
  selectedParent,
  selectedChild,
  setSelectedParent,
  setSelectedChild,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  selectedProducts,
  handleSelectProduct,
  getImageUrl,
  formatVND,
  currentPage,
  setCurrentPage,
  totalPages,
  onPageChange,
}) {
  // Xử lý chọn danh mục cha, reset danh mục con và trang về 1
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParent(parentId);
    setSelectedChild('');
    setCurrentPage(1);
    onPageChange(1);
  };

  // Chọn danh mục con, reset trang về 1
  const handleChildChange = (e) => {
    setSelectedChild(e.target.value);
    setCurrentPage(1);
    onPageChange(1);
  };

  // Thay đổi tìm kiếm, reset trang về 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    onPageChange(1);
  };

  // Chuyển trang
  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange(page);
  };

  return (
    <>
      <h5>Chọn sản phẩm áp dụng</h5>
      <div className="mb-3">
        <strong>Số sản phẩm áp dụng mã: </strong> {selectedProducts.length}
      </div>
      <Row className="mb-2">
        {/* <Col md={4}>
          <Form.Select value={selectedParent} onChange={handleParentChange}>
            <option value="">-- Danh mục cha --</option>
            {categories
              .filter((cat) => cat.parent_id === null)
              .map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedChild}
            onChange={handleChildChange}
            disabled={!selectedParent}
          >
            <option value="">-- Danh mục con --</option>
            {categories
              .filter((cat) => cat.parent_id === parseInt(selectedParent))
              .map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
          </Form.Select>
        </Col> */}
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '5px',
        }}
      >
        <Table bordered hover responsive size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.products_id}
                  className={
                    selectedProducts.includes(product.products_id)
                      ? 'table-success'
                      : ''
                  }
                >
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedProducts.includes(product.products_id)}
                      onChange={() => handleSelectProduct(product.products_id)}
                    />
                  </td>
                  <td>
                    <img
                      src={getImageUrl(product.main_image_url)}
                      alt={product.products_name}
                      width="50"
                      height="50"
                      style={{ objectFit: 'cover' }}
                    />
                  </td>
                  <td>{product.products_name}</td>
                  <td>{formatVND(product.sale_price)} VNĐ</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Không tìm thấy sản phẩm phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-2">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageClick(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={currentPage === page}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageClick(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </>
  );
}
