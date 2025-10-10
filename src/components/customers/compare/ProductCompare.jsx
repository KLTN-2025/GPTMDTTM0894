import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useCompare } from '../../../contexts/CompareContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API_CONFIG from "@/config/api";

export default function ProductCompare() {
  const { compareProductIds, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();
  const [compareProducts, setCompareProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (compareProductIds.length === 0) {
        setCompareProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const productPromises = compareProductIds.map(async (productId) => {
          const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/products/id/${productId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch product ${productId}`);
          }
          
          return response.json();
        });

        const products = await Promise.all(productPromises);
        
        const transformedProducts = products.map(productData => ({
          id_products: productData.product.id_products,
          products_slug: productData.product.products_slug,
          products_name: productData.product.products_name,
          products_sale_price: productData.product.salePrice || productData.product.products_sale_price,
          products_market_price: productData.product.marketPrice || productData.product.products_market_price,
          products_shorts: productData.product.products_shorts,
          images: productData.images || [],
          specs: productData.specs || [],
          variants: productData.skus || [],
          productAttributeValues: productData.attributes || [],
          products_status: productData.products_status || 0
        }));
            console.log(transformedProducts);
            
        setCompareProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [compareProductIds]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };


  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3">Đang tải thông tin sản phẩm...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>Lỗi</h2>
          <p className="text-danger">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </Container>
    );
  }

  if (compareProducts.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>So sánh sản phẩm</h2>
          <p className="text-muted">Chưa có sản phẩm nào để so sánh</p>
          <Link href="/" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </div>
      </Container>
    );
  }

  const allSpecs = [];
  compareProducts.forEach(product => {
    if (product.specs) {
      product.specs.forEach(spec => {
        if (!allSpecs.find(s => s.spec_name === spec.spec_name)) {
          allSpecs.push({ spec_name: spec.spec_name });
        }
      });
    }
  });

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>So sánh sản phẩm ({compareProducts.length}/2)</h2>
        <div>
          <Button variant="outline-danger" onClick={clearCompare} className="me-2">
            Xóa tất cả
          </Button>
          <Button variant="outline-secondary" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </div>

      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <strong>Sản phẩm</strong>
                </Col>
                {compareProducts.map((product, index) => (
                  <Col key={product.id_products} md={compareProducts.length === 1 ? 9 : 4}>
                    <div className="text-center">
                      <h6 className="mt-3 mb-2">{product.products_name}</h6>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCompare(product.id_products)}
                      >
                        Xóa khỏi so sánh
                      </Button>
                    </div>
                  </Col>
                ))}
                
                {compareProducts.length === 1 && (
                  <Col md={4}>
                    <div className="text-center border rounded p-4" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <p className="text-muted mb-2">Thêm sản phẩm thứ 2 để so sánh</p>
                      <Link href="/" className="btn btn-outline-primary btn-sm">
                        Chọn sản phẩm
                      </Link>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Thông tin chi tiết</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <tbody>

                  <tr className="table-light">
                    <td className="fw-bold" style={{ width: '200px' }}>Giá bán</td>
                    {compareProducts.map(product => (
                      <td key={`price-${product.id_products}`}>
                        <div className="d-flex flex-column">
                          <span className="text-danger fw-bold fs-5">
                            {product.products_status == 4 ? 'Giá dự kiến' : formatCurrency(product.products_sale_price)}
                          </span>
                        </div>
                      </td>
                    ))}
                    {compareProducts.length === 1 && <td className="text-muted">-</td>}
                  </tr>

                  {/* Description */}
                  <tr>
                    <td className="fw-bold">Mô tả ngắn</td>
                    {compareProducts.map(product => (
                      <td key={`desc-${product.id_products}`}>
                        {product.products_shorts || '-'}
                      </td>
                    ))}
                    {compareProducts.length === 1 && <td className="text-muted">-</td>}
                  </tr>

                  {/* Variants/Options */}
                  <tr className="table-light">
                    <td className="fw-bold">Tùy chọn</td>
                    {compareProducts.map(product => (
                      <td key={`variants-${product.id_products}`}>
                        {product.productAttributeValues && product.productAttributeValues.length > 0 ? (
                          <div>
                            {product.productAttributeValues.map((attr, attrIndex) => (
                              <div key={attrIndex} className="mb-2">
                                <small className="fw-bold">{attr.name}:</small>
                                <div>
                                  {attr.values && attr.values.map((value, valueIndex) => (
                                    <Badge key={valueIndex} bg="secondary" className="me-1 mb-1">
                                      {attr.type === 2 ? value.value_note : value.value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">Không có tùy chọn</span>
                        )}
                      </td>
                    ))}
                    {compareProducts.length === 1 && <td className="text-muted">-</td>}
                  </tr>

                  {/* Specifications */}
                  {allSpecs.map((spec, specIndex) => (
                    <tr key={`spec-${specIndex}`} className={specIndex % 2 === 0 ? 'table-light' : ''}>
                      <td className="fw-bold">{spec.spec_name}</td>
                      {compareProducts.map(product => {
                        const productSpec = product.specs?.find(s => s.spec_name === spec.spec_name);
                        return (
                          <td key={`spec-${product.id_products}-${specIndex}`}>
                            {productSpec ? productSpec.spec_value : '-'}
                          </td>
                        );
                      })}
                      {compareProducts.length === 1 && <td className="text-muted">-</td>}
                    </tr>
                  ))}

                  {/* Actions */}
                  <tr>
                    <td className="fw-bold">Hành động</td>
                    {compareProducts.map(product => (
                      <td key={`actions-${product.id_products}`}>
                        <div className="d-flex flex-column gap-2">
                          <Link 
                            href={`/productDetail/${product.products_slug}`}
                            className="btn btn-primary btn-sm"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </td>
                    ))}
                    {compareProducts.length === 1 && <td className="text-muted">-</td>}
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
