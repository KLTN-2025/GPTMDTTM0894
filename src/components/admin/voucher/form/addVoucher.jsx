import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './AddModal/formAdd';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_CONFIG } from "@/config/api";

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
  // All product-related state removed - vouchers now apply to total order value only

  const formatVND = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
  const parseVND = (str) => (str ? str.replace(/\./g, '') : '');

  const handleChange = (e) => {
    const { name, value } = e.target;

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
        if (/^\d{0,3}$/.test(percentValue) && (+percentValue <= 100 || percentValue === '')) {
          toast.error("Giảm tối thiểu 100%")
          return setForm((prev) => ({
            ...prev,
            discount_value: percentValue,
          
          }));
        }
      } else {
        const onlyNums = parseVND(value);
        const numericValue = parseInt(onlyNums || '0');

        if (numericValue > 10000000){
          toast.error("Giảm tối thiểu 10 triệu")
        } // ❌ vượt quá 10 triệu → không cho nhập

        if (/^\d*$/.test(onlyNums)) {
          return setForm((prev) => ({
            ...prev,
            discount_value: onlyNums,
          }));
        }
      }

      return;
    }

    // Validate các giá trị khác
    if (['min_order_value', 'user_limit', 'usage_limit'].includes(name)) {
      const val = parseVND(value);
      const numericValue = parseInt(val || '0');

      if (name === 'min_order_value' && numericValue > 50000000) {
        toast.error("Đơn hàng tối thiểu 50 triệu");
      } // ❌ vượt quá 50 triệu

      if (/^\d*$/.test(val)) {
        return setForm((prev) => ({
          ...prev,
          [name]: val,
        }));
      }

      return;
    }

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

  // Product selection handler removed - vouchers now apply to total order value only

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
      // productIds removed - vouchers now apply to total order value only
    };

   try {
      await axios.post(API_CONFIG.getApiUrl("/voucher"), payload);
      // alert('🎉 Tạo voucher thành công!');
      toast.success("Tạo voucher thành công!");
      setForm({ ...defaultForm });
      // Product selection state reset removed - vouchers now apply to total order value only
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
  // Category fetching useEffect removed - vouchers now apply to total order value only

  // Product fetching logic removed - vouchers now apply to total order value only

  // Product filtering logic removed - vouchers now apply to total order value only

  const getImageUrl = (path) => {
    if (!path) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    return path.startsWith('http') ? path : `${API_CONFIG.BACKEND_URL}${path}`;
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm Mã Giảm Giá</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FormAdd form={form} handleChange={handleChange} formatVND={formatVND} />
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
