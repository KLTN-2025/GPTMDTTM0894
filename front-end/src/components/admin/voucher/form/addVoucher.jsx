import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './AddModal/formAdd';

import axios from 'axios';
import { toast } from 'react-toastify';

const defaultForm = {
  name: '',
  code: '',
  description: '',
  discount_type: 'percent',
  discount_value: '',
  min_order_value: '',
  user_limit: '',
  usage_limit: '',
  start_date: '',
  end_date: '',
  status: 1,
};

export default function AddVoucherModal({ show, handleClose, onSuccess }) {
  const [form, setForm] = useState({ ...defaultForm });
  // const [products, setProducts] = useState([]);
  // const [filteredProducts, setFilteredProducts] = useState([]);
  // const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatVND = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
  const parseVND = (str) => (str ? str.replace(/\./g, '') : '');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Chọn loại giảm
    if (name === 'discount_type') {
      return setForm((prev) => ({
        ...prev,
        discount_type: value,
        discount_value: '',
      }));
    }

    // Validate giá trị giảm
    if (name === 'discount_value') {
      const isPercent = form.discount_type === 'percent';

      if (isPercent) {
        const percentValue = value.replace(/\D/g, '');
        if (/^\d{0,3}$/.test(percentValue)) {
          if (percentValue !== '' && +percentValue > 100) {
            toast.error("Giảm tối đa 100%", { toastId: 'discount-percent' });
          }
          return setForm((prev) => ({
            ...prev,
            discount_value: percentValue,
          }));
        }
      } else {
        const onlyNums = parseVND(value);
        const numericValue = parseInt(onlyNums || '0');

        if (numericValue > 10000000) {
          toast.error("Giảm tối đa 10 triệu", { toastId: 'discount-fixed' });
          // Không set giá trị vượt quá 10 triệu
          return;
        }

        if (/^\d*$/.test(onlyNums)) {
          return setForm((prev) => ({
            ...prev,
            discount_value: onlyNums,
          }));
        }
      }

      return;
    }

    // Validate các giá trị khác: min_order_value, user_limit, usage_limit
    if (['min_order_value', 'user_limit', 'usage_limit'].includes(name)) {
      const val = parseVND(value);
      const numericValue = parseInt(val || '0');

      if (name === 'min_order_value' && numericValue > 50000000) {
        toast.error("Đơn hàng tối đa 50 triệu", { toastId: 'min-order-value' });
        return;
      }

      if (/^\d*$/.test(val)) {
        return setForm((prev) => ({
          ...prev,
          [name]: val,
        }));
      }

      return;
    }

    // Các input khác
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  const getAllChildCategoryIds = (parentId) => {
    const result = [];
    const traverse = (id) => {
      result.push(id);
      const children = categories.filter((cat) => cat.parent_id === id);
      children.forEach((child) => traverse(child.category_id));
    };
    traverse(parseInt(parentId));
    return result;
  };

  // const handleSelectProduct = (id) => {
  //   setSelectedProducts((prev) =>
  //     prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
  //   );
  // };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.discount_value) {
      // alert('Vui lòng nhập đầy đủ các trường bắt buộc.');
      toast.error('Vui lòng nhập đầy đủ các trường!');
      return;
    }

    const payload = {
      ...form,
      discount_value: parseFloat(form.discount_value || 0),
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
      user_limit: form.user_limit ? parseInt(form.user_limit) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      // productIds: selectedProducts,
    };

   try {
      await axios.post('http://localhost:5000/api/voucher', payload);
      // alert('🎉 Tạo voucher thành công!');
      toast.success("Tạo voucher thành công!");
      setForm({ ...defaultForm });
      // setSelectedProducts([]);
      setSearchTerm('');
      setSelectedParent('');
      setSelectedChild('');
      handleClose();
      onSuccess?.();
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        err.message ||
        'Tạo voucher thất bại!';

      // alert(`❌ ${errorMessage}`);
      toast.error(`${errorMessage}`);
      console.error('Lỗi tạo voucher:', err.response?.data, err.response?.status, err.message);
    }

  };

  // Lấy danh mục
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/categories')
      .then((res) => {
        const flat = [];
        const traverse = (node) => {
          flat.push({ category_id: node.category_id, name: node.name, parent_id: node.parent_id });
          node.children?.forEach(traverse);
        };
        res.data.forEach(traverse);
        setCategories(flat);
      })
      .catch((err) => console.error('Lỗi danh mục:', err));
  }, []);

  // Lấy sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let categoryIds = [];
        if (selectedChild) categoryIds = [parseInt(selectedChild)];
        else if (selectedParent) categoryIds = getAllChildCategoryIds(selectedParent);

        const params = {
          search: searchTerm || undefined,
          category_ids: categoryIds.length ? categoryIds : undefined,
        };

        const res = await axios.get('http://localhost:5000/api/products', {
          params: {
            search: searchTerm || undefined,
            category_ids: categoryIds.length ? categoryIds : undefined,
            page: currentPage,
            limit: 5
          }
        });

        // setProducts(res.data.products || []);
        // setFilteredProducts(res.data.products || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedChild, selectedParent, categories, currentPage]);

  // Lọc sản phẩm
  // useEffect(() => {
  //   let filtered = [...products];

  //   if (searchTerm) {
  //     filtered = filtered.filter((p) =>
  //       p.products_name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }

  //   if (selectedChild) {
  //     filtered = filtered.filter((p) => p.category_id === parseInt(selectedChild));
  //   }

  //   setFilteredProducts(filtered);
  // }, [searchTerm, selectedChild, products]);

  const getImageUrl = (path) => {
    if (!path) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    return path.startsWith('http') ? path : `http://localhost:5000${path}`;
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm Mã Giảm Giá</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FormAdd form={form} handleChange={handleChange} formatVND={formatVND} />
          {/* <FormList
            categories={categories}
            selectedParent={selectedParent}
            setSelectedParent={setSelectedParent}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            handleSelectProduct={handleSelectProduct}
            getImageUrl={getImageUrl}
            formatVND={formatVND}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          /> */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
