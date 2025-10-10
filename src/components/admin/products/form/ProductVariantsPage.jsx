'use client';
import { useState, useEffect } from "react";
import { Card, Button, Container, Row, Col, Badge, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import OptionsManager from "./addProductComponents/OptionManager";
import SkuManager from "./addProductComponents/skuManager";
import axios from "axios";
import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function ProductVariantsPage({ productId }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState([]); // Để tương thích với SkuManager

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(API_CONFIG.getApiUrl(`/variants/admin/${productId}`));
      // API trả về dữ liệu trong response.data.product
      const productData = response.data.product || response.data;
      console.log('Product Data:', productData); // Debug log
      setProduct(productData);

      if (response.data.attributes) {
        const transformedOptions = response.data.attributes.map(attr => ({
          id: attr.id_attribute,
          name: attr.name,
          type: attr.type,
          values: attr.values.map(val => ({
            id: val.id_value,
            label: attr.type === 2 ? (val.value_note || val.value) : val.value, // Color có note, text thì dùng value
            value: val.value,
            value_note: val.value_note,
            status: val.status,
            images: []
          }))
        }));
        console.log('🔍 Transformed options:', transformedOptions);
        setOptions(transformedOptions);
      }

      if (response.data.skus && response.data.skus.length > 0) {
        const transformedSkus = response.data.skus.map(sku => ({
          combo: sku.option_combo.map(combo => ({
            label: combo.type === 2 ?
              (response.data.attributes
                .find(attr => attr.name === combo.attribute)?.values
                .find(val => val.value === combo.value)?.value_note || combo.value)
              : combo.value,
            value: combo.value,
            optionName: combo.attribute,
            id_value: combo.id_value,
            type: combo.type
          })),
          price_sale: sku.price_sale || 0,
          quantity: sku.quantity || 0,
          status: sku.status === 1 ? 2 : 1,
          main_image_index: null,
          images: (sku.images || []).map(img => ({
            url: img.Img_url,
            isMain: img.is_main || false,
            id_product_img: img.id_product_img,
          })),
          variant_id: sku.variant_id,
          sku: sku.sku || ''
        }));
        console.log('🔍 Transformed SKUs:', transformedSkus);
        setSkuList(transformedSkus);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVariants = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      // Gửi attributes với đúng format
      formData.append('attributes', JSON.stringify(options));

      const transformedVariants = skuList.map(sku => ({
        combination: sku.combo.map(c => ({
          attributeName: c.optionName,
          value: c.value // Giữ nguyên value gốc (hex code cho màu, text cho size)
        })),
        price_sale: sku.price_sale || 0,
        quantity: sku.quantity || 0,
        status: sku.status === 2 ? 1 : 0, // Convert Frontend: 2=Hiển thị→1=active, 1=Ẩn→0=inactive
        sku: sku.sku || '',
        images: sku.images || [],
        variant_id: sku.variant_id || null
      }));

      formData.append('variants', JSON.stringify(transformedVariants));

      // Xử lý ảnh theo option nếu có
      options.forEach(option => {
        option.values.forEach(value => {
          (value.images || []).forEach(img => {
            if (img.file) {
              formData.append('optionImages', img.file);
              formData.append('optionImageIsMain', img.isMain === 1 ? 'true' : 'false');
              formData.append('optionImageValues', value.label);
            }
          });
        });
      });

      // Xử lý ảnh SKU
      const variantImageData = [];
      skuList.forEach((sku, skuIndex) => {
        (sku.images || []).forEach(img => {
          if (img.file) {
            formData.append('variantImages', img.file);
            variantImageData.push({
              variantIndex: skuIndex,
              isMain: img.isMain || false
            });
          }
        });
      });

      if (variantImageData.length > 0) {
        formData.append('variantImageData', JSON.stringify(variantImageData));
      }

      console.log('🔍 Sending variants data:', transformedVariants); // Debug log
      console.log('🔍 Sending attributes:', options); // Debug log
      console.log('🔍 Sending variant images:', variantImageData); // Debug log

      await axios.put(API_CONFIG.getApiUrl(`/variants/${productId}/variants`), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Cập nhật biến thể thành công!');
      fetchProductDetails();

    } catch (error) {
      console.error('Error saving variants:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Lỗi cập nhật biến thể: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = () => {
    toast.success('Hoàn tất tạo sản phẩm!');
    router.push('/admin/products');
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Không tìm thấy sản phẩm
        </Alert>
      </Container>
    );
  }

  const breadcrumbItems = [
    { label: "Quản lý sản phẩm", href: "/admin/products" },
    { label: product?.products_name || "Sản phẩm", href: `/admin/products?id=${productId}` },
    { label: "Quản lý biến thể" }
  ];

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Quản lý biến thể sản phẩm</h2>
              <div className="d-flex align-items-center mt-2">
                <Badge bg="primary" className="me-2">ID: {product.id_products}</Badge>
                <span className="text-muted">{product.products_name}</span>
              </div>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={handleBack} className="me-2">
                <i className="bi bi-arrow-left"></i> Quay lại
              </Button>
            </div>
          </div>

          {/* Quản lý thuộc tính */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-tags me-2"></i>
                Quản lý thuộc tính sản phẩm
              </h5>
            </Card.Header>
            <Card.Body>
              <OptionsManager options={options} setOptions={setOptions} />
            </Card.Body>
          </Card>

          {/* Quản lý SKU/Biến thể */}
          {options.length >= 1 && options.some(opt => opt.values && opt.values.length > 0) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  Quản lý SKU/Biến thể
                </h5>
              </Card.Header>
              <Card.Body>
                <SkuManager
                  options={options}
                  skuList={skuList}
                  setSkuList={setSkuList}
                  images={images}
                />
              </Card.Body>
            </Card>
          )}

          {/* Action buttons */}
          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={handleBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </Button>

            <div className="d-flex gap-3">
              {options.length > 0 && (
                <Button
                  variant="success"
                  onClick={handleSaveVariants}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2 me-2"></i>
                      Lưu biến thể
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="primary"
                onClick={handleComplete}
              >
                <i className="bi bi-check-circle me-2"></i>
                Hoàn tất
              </Button>
            </div>
          </div>

          {/* Hướng dẫn */}
          {options.length === 0 && (
            <Alert variant="info" className="mt-4">
              <i className="bi bi-lightbulb me-2"></i>
              <strong>Hướng dẫn:</strong> Thêm ít nhất 1 thuộc tính (như Màu sắc, Dung lượng) để tạo các biến thể sản phẩm.
              Nếu sản phẩm không có biến thể, bạn có thể bỏ qua bước này và nhấn "Hoàn tất".
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}
