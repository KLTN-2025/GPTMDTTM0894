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
import { API_CONFIG } from "@/config/api";

export default function EditProductPage({ productId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
  const [productName, setProductName] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productShorts, setProductShorts] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [images, setImages] = useState([]);
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [productStatus, setProductStatus] = useState(2); // Mặc định là hiển thị

  const [touched, setTouched] = useState({
    productName: false,
    productShorts: false,
    salePrice: false,
    productQuantity: false,
  });
  
  // Load existing product data
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_CONFIG.getApiUrl(`/variants/admin/${productId}`));
      const data = response.data;

      console.log('Loaded product data:', data);

      // Populate form with existing data
      setProductName(data.product.products_name || '');
      setProductSlug(data.product.products_slug || '');
      setProductShorts(data.product.products_shorts || '');
      setSalePrice(data.product.products_sale_price || '');
      setProductQuantity(data.product.products_quantity || 0);
      setDescription(data.product.products_description || '');
      setProductStatus(data.product.products_status || 2);

      // Set category
      if (data.category) {
        if (data.category.parent_id) {
          setSelectedParent(Number(data.category.parent_id));
          setSelectedChild(Number(data.category.category_id));
        } else {
          setSelectedParent(Number(data.category.category_id));
          setSelectedChild(null);
        }
      }

      // Set images
      setImages(data.images.map(img => ({
        id: img.id_product_img,
        url: img.Img_url,
        isMain: img.is_main,
        file: null // Existing image, no file
      })));

      // Set specs
      if (data.specs && data.specs.length > 0) {
        setSpecs(data.specs.map(spec => ({
          name: spec.spec_name,
          value: spec.spec_value
        })));
      }

    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const errors = {
    productName: !productName.trim() ? 'Vui lòng nhập tên sản phẩm' : '',
    productShorts: !productShorts.trim() ? 'Vui lòng nhập mô tả ngắn' : '',
    salePrice: !salePrice || isNaN(salePrice.replace(/\./g, '')) ? 'Giá bán không hợp lệ' : '',
    productQuantity: productQuantity <= 0 ? 'Số lượng không hợp lệ' : '',
  };

  // Validate form inputs
  const validateForm = () => {
    const categoryId = selectedChild || selectedParent;
    const valid =
      productName.trim() &&
      categoryId &&
      salePrice && !isNaN(salePrice.replace(/\./g, '')) && Number(salePrice.replace(/\./g, '')) >= 0 &&
      images.length > 0;

    setFormValid(valid);
    return valid;
  };

  useEffect(() => {
    validateForm();
  }, [productName, selectedParent, selectedChild, salePrice, images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Basic product info
      formData.append('products_name', productName);
      formData.append('products_shorts', productShorts);
      formData.append('products_description', description);
      formData.append('products_sale_price', salePrice.replace(/\./g, ''));
      formData.append('products_quantity', productQuantity);
      formData.append('products_status', productStatus);
      formData.append('category_id', selectedChild || selectedParent || '');

      // Specs
      const validSpecs = specs.filter(spec => spec.name.trim() && spec.value.trim());
      formData.append('specs', JSON.stringify(validSpecs));

      // Handle existing images
      const existingImages = images.filter(img => !img.file);
      formData.append('existingImages', JSON.stringify(existingImages.map(img => ({
        Img_url: img.url,
        is_main: img.isMain,
        id_product_img: img.id
      }))));

      // Handle new images
      const newImages = images.filter(img => img.file);
      newImages.forEach((img, index) => {
        formData.append('commonImages', img.file);
      });

      console.log('Submitting images:', {
        existingImagesCount: existingImages.length,
        newImagesCount: newImages.length,
        existingImages: existingImages.map(img => img.url)
      });

      const response = await axios.put(API_CONFIG.getApiUrl(`/variants/${productId}`), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Cập nhật sản phẩm thành công!');
        
        // Navigate to variants page
        const nextUrl = `/admin/products`;
        router.push(nextUrl);
      } else {
        throw new Error(response.data.message || 'Unknown error');
      }

    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Lỗi cập nhật sản phẩm: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải thông tin sản phẩm...</p>
        </div>
      </Container>
    );
  }


  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Chỉnh sửa sản phẩm</h1>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Main Content */}
          <Col lg={8}>
            {/* Basic Info */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
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

            {/* Description */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-file-text me-2"></i>
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

            {/* Product Specs */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Thông số kỹ thuật
                </h5>
              </Card.Header>
              <Card.Body>
                <SpecEditor 
                  specs={specs}
                  setSpecs={setSpecs}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Sidebar */}
          <Col lg={4}>
            {/* Category */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-tags me-2"></i>
                  Danh mục
                </h5>
              </Card.Header>
              <Card.Body>
                <CategorySelector
                  selectedParent={selectedParent}
                  selectedChild={selectedChild}
                  setSelectedParent={setSelectedParent}
                  setSelectedChild={setSelectedChild}
                />
              </Card.Body>
            </Card>

            {/* Images */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-images me-2"></i>
                  Hình ảnh sản phẩm
                </h5>
              </Card.Header>
              <Card.Body>
                <ImgUploaded 
                  images={images}
                  setImages={setImages}
                />
              </Card.Body>
            </Card>

            {/* Product Status */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-toggle-on me-2"></i>
                  Trạng thái sản phẩm
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Chọn trạng thái</Form.Label>
                  <Form.Select 
                    value={productStatus} 
                    onChange={(e) => setProductStatus(Number(e.target.value))}
                  >
                    <option value={1}>Chờ duyệt</option>
                    <option value={2}>Hiển thị</option>
                    <option value={3}>Đã ẩn</option>
                    <option value={4}>Sắp ra mắt</option>
                  </Form.Select>
                </Form.Group>
                <div className="mt-2">
                  {productStatus === 1 && <small className="text-warning">Sản phẩm đang chờ duyệt</small>}
                  {productStatus === 2 && <small className="text-success">Sản phẩm đang được hiển thị</small>}
                  {productStatus === 3 && <small className="text-secondary">Sản phẩm đã bị ẩn</small>}
                  {productStatus === 4 && <small className="text-info">Sản phẩm sắp ra mắt</small>}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-4">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={!formValid || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang cập nhật...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Lưu và tiếp tục
              </>
            )}
          </Button>
          
          <Button 
            variant="outline-secondary" 
            type="button" 
            onClick={() => router.back()}
            size="lg"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </Form>
    </Container>
  );
}
