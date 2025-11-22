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
  totalPages,
  onPageChange
}) {
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let page = 1; page <= totalPages; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-2">
        <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  return (
    <>
      <h5>Chọn sản phẩm áp dụng</h5>
      <Row className="mb-2">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
        <Table bordered hover responsive size="sm">
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
                  className={selectedProducts.includes(product.products_id) ? 'table-success' : ''}
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

      {renderPagination()}
    </>
  );
}
