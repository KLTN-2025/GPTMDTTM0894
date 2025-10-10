import { Modal, Button, Form, Card } from "react-bootstrap";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation'; 
import { nanoid } from 'nanoid';
import BasicInfo from "./updateProductComponents/BasicInfo";
import CategorySelector from "./updateProductComponents/CategorySelector";
import DescriptionEditor from "./updateProductComponents/DescriptionEditor";
import SpecEditor from "./updateProductComponents/SpecEditor";
import ImgUploaded from "./updateProductComponents/ImgUploaded";
import OptionsManager from "./updateProductComponents/OptionManager";
import SkuManager from "./updateProductComponents/skuManager";
import axios from "axios";
import { toast } from "react-toastify";
import React, { useMemo } from 'react';
import API_CONFIG from "@/config/api";

function EditProductModalContent({ show, onClose, onUpdate, productData }) {
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [productName, setProductName] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productShorts, setProductShorts] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [images, setImages] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [status, setStatus] = useState(1);

  const router = useRouter();                
  const searchParams = useSearchParams();    
  const [formValid, setFormValid] = useState(false);
  const hasLoadedImages = useRef(false);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    router.replace(`/admin/products?${params.toString()}`, { scroll: false });
    onClose?.();
  };

  function getOptionCombinations(arr) {
    if (!arr.length) return [];
    if (arr.length === 1) return arr[0].map(v => [v]);

    const result = [];
    const restCombinations = getOptionCombinations(arr.slice(1));
    for (const value of arr[0]) {
      for (const combo of restCombinations) {
        result.push([value, ...combo]);
      }
    }
    return result;
  }
  useEffect(() => {
    if (!productData) return;
    if (hasLoadedImages.current) return;
    const product = productData.product || productData;

    setProductQuantity(product.products_quantity)
    setProductName(product.products_name || "");
    setProductSlug(product.products_slug || "");
    setProductShorts(product.products_shorts || "");
    setMarketPrice(product.products_market_price?.toString() || "");
    setSalePrice(product.products_sale_price?.toString() || "");
    setDescription(product.products_description || "");
    setStatus(
      typeof product.products_status === "number"
        ? product.products_status
        : product.products_status === true
          ? 2
          : 1
    );

    const { category } = productData;
    setSelectedChild(category?.category_id || null);
    setSelectedParent(category?.parent?.category_id || null);

    const normalizedSpecs = (productData.specs || []).map((spec) => ({
      name: spec.spec_name || "",
      value: spec.spec_value || "",
      id_spec: spec.id_spec || null,
    }));
    setSpecs(normalizedSpecs);

    // Chuẩn hóa options
    const normalizedAttributes = (productData.attributes || []).map((attr) => ({
      id_attribute: attr.id_attribute,
      name: attr.name || `Option ${attr.id_attribute}`,
      type: /màu|color/i.test(attr.name) ? 2 : 1,
      values: (attr.values || []).map((val) => ({
        value_id: val.value_id || val.id_value || null,
        value: val.value || "",
        value_note: val.value_note || "",
        extraPrice: val.extra_price || 0,
        quantity: val.quantity || 0,
        status: val.status ?? 2,
        color_code: val.color_code || "",
        images: (val.images || []).map((img) => ({
          id_product_img: img.id_product_img,
          id_value: val.value_id, // 💡 thêm dòng này
          url: img.Img_url?.startsWith("/uploads")
            ? `${API_CONFIG.BACKEND_URL}${img.Img_url}`
            : img.Img_url,
          isMain: img.is_main === true,
          fromServer: true,
        })),
      })),
    }));
    setOptions(normalizedAttributes);

    // Helper sinh tổ hợp
    function getCombinations(matrix, prefix = []) {
      if (matrix.length === 0) return [prefix];
      const [first, ...rest] = matrix;
      return first.flatMap(val => getCombinations(rest, [...prefix, val]));
    }

    // Tạo tổ hợp giá trị từ attributes
    const newSkuList = (productData.skus || []).map((sku) => {
      const combo = sku.option_combo.map(({ attribute, value }) => {
        const option = normalizedAttributes.find(opt => opt.name === attribute);
        const valueItem = option?.values.find(v => v.value === value);
        return {
          value,
          label: valueItem?.label || value,
          optionName: attribute,
        };
      });

      return {
        combo,
        price: Number(sku.price) || 0,
        price_sale: Number(sku.price_sale) || 0,
        quantity: sku.quantity || 0,
        status: sku.status || 2,
        images: sku.images || [],
        sku_id: sku.variant_id,
        sku_code: sku.sku_code || '',
      };
    });

    setSkuList(newSkuList);

    const imageList = (productData.images || []).map((img) => ({
      id: img.id_product_img || nanoid(), 
      file: null,
      isMain: img.is_main === 1 || img.is_main === true,
      optionKey: img.option_key || "",
      optionValue: img.option_value || "",
      previewUrl: img.Img_url?.startsWith("/uploads")
        ? `${API_CONFIG.BACKEND_URL}${img.Img_url}`
        : img.Img_url,
      fromServer: true,
    }));
    setImages(imageList);
    hasLoadedImages.current = true;
  }, [productData]);

  useEffect(() => {
    const categoryId = selectedChild ?? selectedParent;
    const valid =
      productName.trim() &&
      categoryId &&
      marketPrice && !isNaN(marketPrice) && Number(marketPrice) >= 0 &&
      salePrice && !isNaN(salePrice) && Number(salePrice) >= 0 &&
      images.length > 0;

    // setFormValid(!!valid);
    console.log(`Images state updated:`, images);
  }, [productName, selectedParent, selectedChild, marketPrice, salePrice, images]);

  const normalizeSkusForBackend = (skuList, options) => {
    return skuList
      .filter(sku =>
        sku.combo?.length === options.length &&
        sku.combo.every(c => c?.value && c?.optionName) &&
        !isNaN(Number(sku.price)) &&
        !isNaN(Number(sku.quantity))
      )
      .map(sku => ({
        variant_id: sku.sku_id || null,
        sku_code: sku.sku_code || '',
        price: Number(sku.price),
        price_sale: Number(sku.price_sale),
        quantity: Number(sku.quantity),
        status: Number(sku.status),
        option_combo: sku.combo.map(c => {
          const attr = options.find(opt => opt.name === c.optionName);
          const val = attr?.values.find(v => v.value === c.value);
          return {
            attribute: c.optionName,
            value: c.value,
            id_value: val?.value_id || val?.id_value || null,
          };
        }),
      }));
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      const validSkus = normalizeSkusForBackend(skuList, options);

      // Lấy ID danh mục (ưu tiên danh mục con)
      const categoryId = selectedChild || selectedParent;

      // Lấy ID sản phẩm
      const productId = productData.product?.id_products || productData.products_id;

      const optionImages = [];
      let optionFileIndex = 0;

      options.forEach(attr => {
        attr.values.forEach(val => {
          if (!val.id_value && !val.value_id && !val.tempId) {
            val.tempId = nanoid(); // <- bạn nhớ import nanoid ở đầu file
          }
        });
      });

      options.forEach(attr => {
        attr.values.forEach(val => {
          if (Array.isArray(val.images)) {
            val.images.forEach((img) => {
              if (img.fromServer) {
                optionImages.push({
                  id_product_img: img.id_product_img,
                  id_products: val.product_id || null,
                  id_value: val.value_id,
                  Img_url: img.url || img.previewUrl || '',
                  is_main: img.isMain,
                });
              } else if (img.file) {
                formData.append('optionFiles', img.file);
                formData.append('optionFileMeta[]', JSON.stringify({
                  id_value: val.value_id || val.id_value || null,  // nếu có
                  tempId: val.tempId || null,                      // nếu mới tạo
                  is_main: img.isMain === true,
                  index: optionFileIndex++,
                }));
              }
            });
          }
        });
      });

      const fixedOptions = options.map(opt => ({
        id_attribute: opt.id_attribute || opt.attribute_id,
        name: opt.name,
        type: opt.type,
        values: opt.values
          .filter(val => val.value?.toString().trim() !== '')
          .map(val => ({
            value_id: val.value_id || val.id_value || null,
            value: val.value || val.label || "",
            value_note: val.value_note || "",
            extra_price: val.extraPrice !== undefined ? Number(val.extraPrice) : 0,
            quantity: val.quantity !== undefined ? Number(val.quantity) : 0,
            status: val.status !== undefined ? Number(val.status) : 1,
            tempId: val.tempId || null,
          }))
      }));

      console.log("🧪 fixedOptions gửi lên:", JSON.stringify(fixedOptions, null, 2));
      
        

      formData.append('attributes', JSON.stringify(fixedOptions));
      formData.append('products_id', productId);
      formData.append('products_name', productName);
      formData.append('products_slug', productSlug);
      formData.append('products_shorts', productShorts);
      formData.append('products_quantity', productQuantity);
      formData.append('products_market_price', Number(marketPrice).toFixed(2));
      formData.append('products_sale_price', Number(salePrice).toFixed(2));
      formData.append('products_description', description);
      formData.append('category_id', selectedChild || selectedParent);
      formData.append('specs', JSON.stringify(specs));
      // formData.append('attributes', JSON.stringify(options));
      formData.append('skus', JSON.stringify(validSkus));
      formData.append("optionImages", JSON.stringify(optionImages));
      formData.append('products_status', status);
      

      // Gửi ảnh mới thêm (ảnh từ client, không phải từ server)
      images.forEach((img, index) => {
        if (!img.fromServer && img.file) {
          // Ảnh mới: gửi file ảnh
          formData.append('images', img.file);
          formData.append('isMainFlags', img.isMain ? 'true' : 'false');
          formData.append('imageOptionKeys', img.optionKey || '');
          formData.append('imageOptionValues', img.optionValue || '');
        } else if (img.fromServer) {
          // Ảnh cũ: gửi metadata để backend giữ lại
          formData.append('existingImages[]', JSON.stringify({
            id: img.id || null,   // nếu có id ảnh (nên có)
            url: img.url || img.previewUrl,
            isMain: img.isMain,
            optionKey: img.optionKey || '',
            optionValue: img.optionValue || '',
          }));
        }
      });
      // console.log("Gửi attributes:", fixedOptions);
      // console.log("Options gửi lên:", options);
      // Gọi API PUT
          await axios.put(API_CONFIG.getApiUrl(`/products/${productId}`), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // alert('Cập nhật sản phẩm thành công');
      toast.success('Cập nhật thành công!')
      onUpdate?.();
      handleClose();
    } catch (error) {
      // console.error('Lỗi cập nhật sản phẩm:', error);
      // toast.error(`Lỗi cập nhật: ${error}`);
      toast.error(`Lỗi: ${error.response?.data?.message || error.message}`);
      // alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const skuManagedOptions = React.useMemo(() => {
    const optionNamesSet = new Set();
    skuList.forEach(sku => {
      sku.combo.forEach(c => {
        if (c.optionName) optionNamesSet.add(c.optionName);
      });
    });
    return Array.from(optionNamesSet);
  }, [skuList]);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Sửa sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>

          <Card className="mb-3 p-3">
            <BasicInfo {...{ 
              productName, setProductName, 
              marketPrice, setMarketPrice, 
              salePrice, setSalePrice,
              productQuantity, setProductQuantity,
              productShorts, setProductShorts,
              productSlug, setProductSlug
              }} />
          </Card>

          <Card className="mb-3 p-3">
            <CategorySelector
              selectedParent={selectedParent}
              setSelectedParent={setSelectedParent}
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              initialParent={productData?.category?.parent?.category_id}
              initialChild={productData?.category?.category_id}
            />

          </Card>

          <Card className="mb-3 p-3">
            <DescriptionEditor {...{ description, setDescription }} />
          </Card>

          <Card className="mb-3 p-3">
            <SpecEditor {...{ specs, setSpecs }} />
          </Card>

          <Card className="mb-3 p-3">

            <OptionsManager 
              options={options} 
              setOptions={setOptions} 
              skuManagedOptions={skuManagedOptions} 
            />

          </Card>

          {options.length >= 2 && (
            <Card className="mb-3 p-3">
              <SkuManager {...{ options, skuList, setSkuList }} />
            </Card>
          )}

          <Card className="mb-3 p-3">
            <ImgUploaded {...{ images, setImages }} />
          </Card>

          <div className="mt-3">
            <label className="form-label">Trạng thái sản phẩm</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(Number(e.target.value))}>
              <option value=''>Tùy chọn</option>
              <option value={2}>Hiển thị</option>
              <option value={3}>Đã ẩn</option>
              <option value={4}>Sắp ra mắt</option>
            </select>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Đóng</Button>
        <Button variant="primary" onClick={handleUpdate}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function EditProductModal({ show, onClose, onUpdate, productData }) {
  if (!show) return null;
  
  return (
    <Suspense fallback={
      <Modal show={show} onHide={onClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Đang tải...</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin sản phẩm...</p>
        </Modal.Body>
      </Modal>
    }>
      <EditProductModalContent 
        show={show} 
        onClose={onClose} 
        onUpdate={onUpdate} 
        productData={productData} 
      />
    </Suspense>
  );
}
