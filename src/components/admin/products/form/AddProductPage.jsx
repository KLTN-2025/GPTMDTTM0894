'use client';
import { useState, useEffect } from "react";
import { Card, Button, Form, Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import AdminBreadcrumb from "../../partials/AdminBreadcrumb";
import BasicInfo from "./addProductComponents/BasicInfo";
import CategorySelector from "./addProductComponents/CategorySelector";
import DescriptionEditor from "./addProductComponents/DescriptionEditor";
import SpecEditor from "./addProductComponents/SpecEditor";
import ImgUploaded from "./addProductComponents/ImgUploaded";
import axios from "axios";
import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function AddProductPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
  const [productName, setProductName] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productShorts, setProductShorts] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [images, setImages] = useState([]);
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const [touched, setTouched] = useState({
    productName: false,
    productShorts: false,
    salePrice: false,
    productQuantity: true,
  });
  
  const errors = {
    productName: !productName.trim() ? 'Vui lòng nhập tên sản phẩm' : '',
    productShorts: !productShorts.trim() ? 'Vui lòng nhập mô tả ngắn' : '',
    salePrice: !salePrice || isNaN(salePrice.replace(/\./g, '')) ? 'Giá bán không hợp lệ' : '',
  };

  // Validate form inputs
  const validateForm = () => {
    const categoryId = selectedChild || selectedParent;
    const valid =
      productName.trim() &&
      categoryId &&
      salePrice && !isNaN(salePrice.replace(/\./g, '')) && Number(salePrice.replace(/\./g, '')) >= 0 &&
      images.length > 0;
    setFormValid(!!valid);
    return !!valid;
  };

  useEffect(() => {
    validateForm();
  }, [productName, productSlug, productShorts, selectedParent, selectedChild, productQuantity, salePrice, images]);

  const handleCreateBasicProduct = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const categoryId = selectedChild || selectedParent;

      // Thông tin cơ bản sản phẩm
      formData.append('products_name', productName);
      formData.append('products_slug', productSlug);
      formData.append('category_id', categoryId);
      formData.append('products_description', description);
      formData.append('products_shorts', productShorts);
      formData.append('products_quantity', productQuantity);
      formData.append('products_sale_price', salePrice.replace(/\./g, ''));

      // Thông số kỹ thuật
      formData.append('specs', JSON.stringify(specs));
      
      // Chỉ có thuộc tính và biến thể rỗng (sẽ thêm ở trang tiếp theo)
      formData.append('attributes', JSON.stringify([]));
      formData.append('variants', JSON.stringify([]));

      // Thay đổi phần upload ảnh
      // Ảnh sản phẩm
      const mainImageIndex = images.findIndex(img => img.isMain);
      formData.append('main_image_index', mainImageIndex !== -1 ? mainImageIndex.toString() : '0');

      images.forEach((img, index) => {
        if (img.file) {
          formData.append('commonImages', img.file);
          formData.append(`commonImageIsMain_${index}`, img.isMain ? 'true' : 'false');
        }
      });

      // Log để debug
      console.log('Images to upload:', images.map(img => ({
        fileName: img.file?.name,
        isMain: img.isMain
      })));

      const res = await axios.post(API_CONFIG.getApiUrl('/products/new'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Tạo sản phẩm thành công! Chuyển đến quản lý biến thể...');
      
      // Chuyển đến trang quản lý biến thể
      setTimeout(() => {
        router.push(`/admin/products/${res.data.product.id_products}/variants`);
      }, 1500);

    } catch (error) {
      console.error('❌ Lỗi tạo sản phẩm:', error);
      toast.error(`Lỗi tạo sản phẩm: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const breadcrumbItems = [
    { label: "Quản lý sản phẩm", href: "/admin/products" },
    { label: "Thêm sản phẩm mới" }
  ];

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Thêm sản phẩm mới</h2>
            <div>
              <Button variant="outline-secondary" onClick={handleCancel} className="me-2">
                <i className="bi bi-arrow-left"></i> Quay lại
              </Button>
            </div>
          </div>

          <Form>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Thông tin cơ bản
                </h5>
              </Card.Header>
              <Card.Body>
                <BasicInfo
                  productName={productName}
                  productSlug={productSlug}
                  setProductSlug={setProductSlug}
                  setProductName={setProductName}
                  salePrice={salePrice}
                  setSalePrice={setSalePrice}
                  setProductQuantity={setProductQuantity}
                  productQuantity={productQuantity}
                  productShorts={productShorts}
                  setProductShorts={setProductShorts}
                  touched={touched}
                  setTouched={setTouched}
                  errors={errors}
                />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-tags me-2"></i>
                  Danh mục sản phẩm
                </h5>
              </Card.Header>
              <Card.Body>
                <CategorySelector
                  selectedParent={selectedParent}
                  setSelectedParent={setSelectedParent}
                  selectedChild={selectedChild}
                  setSelectedChild={setSelectedChild}
                />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-card-text me-2"></i>
                  Mô tả sản phẩm
                </h5>
              </Card.Header>
              <Card.Body>
                <DescriptionEditor 
                  description={description} 
                  setDescription={setDescription} 
                />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Thông số kỹ thuật
                </h5>
              </Card.Header>
              <Card.Body>
                <SpecEditor specs={specs} setSpecs={setSpecs} />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-images me-2"></i>
                  Hình ảnh sản phẩm
                </h5>
              </Card.Header>
              <Card.Body>
                <ImgUploaded images={images} setImages={setImages} />
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-3">
              <Button variant="outline-secondary" onClick={handleCancel}>
                Hủy bỏ
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateBasicProduct}
                disabled={!formValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    Tạo sản phẩm & Tiếp tục
                    <i className="bi bi-arrow-right ms-2"></i>
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
