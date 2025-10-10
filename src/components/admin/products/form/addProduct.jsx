import { Modal, Button, Form, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import BasicInfo from "./addProductComponents/BasicInfo";
import CategorySelector from "./addProductComponents/CategorySelector";
import DescriptionEditor from "./addProductComponents/DescriptionEditor";
import SpecEditor from "./addProductComponents/SpecEditor";
import ImgUploaded from "./addProductComponents/ImgUploaded";
import OptionsManager from "./addProductComponents/OptionManager";
import SkuManager from "./addProductComponents/skuManager";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";

export default function AddProductModal({ show, onClose, onAdd }) {
  const [description, setDescription] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
  const [options, setOptions] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [productName, setProductName] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productShorts, setProductShorts] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [images, setImages] = useState([]); // [{ file, isMain, optionKey?, optionValue? }]
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);

  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const [touched, setTouched] = useState({
    productName: false,
    productShorts: false,
    salePrice: false,
    productQuantity: false,
  });
  
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
      salePrice && !isNaN(salePrice) && Number(salePrice) >= 0 &&
      images.length > 0;
    setFormValid(!!valid);
    return !!valid;
  };

  useEffect(() => {
    validateForm(); // Kiểm tra mỗi khi dữ liệu thay đổi
  }, 

  [
    productName, 
    productSlug,
    productShorts,
    selectedParent, 
    selectedChild, 
    productQuantity,
    salePrice, 
    images
  ]);


  const handleAdd = async () => {
    try {
      const formData = new FormData();
      const categoryId = selectedChild || selectedParent;

      // 🟢 Thêm thông tin cơ bản
      formData.append('products_name', productName);
      formData.append('products_slug', productSlug);
      formData.append('category_id', categoryId);
      formData.append('products_description', description);
      formData.append('products_shorts', productShorts);
      formData.append('products_quantity', productQuantity);
      formData.append('products_sale_price', salePrice.replace(/\./g, ''));

      // 🟢 Thêm thông số kỹ thuật
      formData.append('specs', JSON.stringify(specs));
      
      // 🟢 Thêm option và sku
      formData.append('attributes', JSON.stringify(options));
      formData.append('variants', JSON.stringify(skuList));

      // 🟢 Ảnh CHUNG (ảnh không gắn với option)
      images.forEach(img => {
        formData.append('commonImages', img.file);
        formData.append('commonImageIsMain', img.isMain ? 'true' : 'false');
      });

      // 🟢 Ảnh theo OPTION
      options.forEach(option => {
        option.values.forEach(value => {
          (value.images || []).forEach(img => {
            formData.append('optionImages', img.file);
            formData.append('optionImageIsMain', img.isMain === 1 ? 'true' : 'false');
            formData.append('optionImageValues', value.label); // dùng label để backend map với id_value
          });
        });
      });

      console.log('📤 Dữ liệu SKU gửi lên:', skuList);

      const res = await axios.post('${API_CONFIG.getApiUrl("/products")}', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // alert('✅ Thêm sản phẩm thành công');
      toast.success('Thêm sản phẩm thành công!');
      onAdd?.();
      onClose();
    } catch (error) {
      // console.error('❌ Lỗi thêm sản phẩm:', error);
      toast.error(`Lỗi thêm sản phẩm: ${error}`);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };


  return (
    <Modal show={show} onHide={onClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Thêm sản phẩm mới</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Card className="mb-3 p-3">
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
              touched = {touched}
              setTouched = {setTouched}
              errors = {errors}
            />
          </Card>

          <Card className="mb-3 p-3">
            <CategorySelector
              selectedParent={selectedParent}
              setSelectedParent={setSelectedParent}
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
            />
          </Card>

          <Card className="mb-3 p-3">
            <DescriptionEditor 
              description={description} 
              setDescription={setDescription} 
            />
          </Card>

          <Card className="mb-3 p-3">
            <SpecEditor specs={specs} setSpecs={setSpecs} />
          </Card>

          <Card className="mb-3 p-3">
            <OptionsManager options={options} setOptions={setOptions} />
          </Card>

          {options.length >= 2 && (
            <Card className="mb-3 p-3">
              <SkuManager
                options={options}
                skuList={skuList}
                setSkuList={setSkuList}
                images={images} 
              />
            </Card>
          )}

          <Card className="mb-3 p-3">
            <ImgUploaded images={images} setImages={setImages} />
          </Card>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} >
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={!formValid}
        >
          Thêm sản phẩm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
