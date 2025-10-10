import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './UpdateModal/formAdd';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_CONFIG from "@/config/api";

export default function EditVoucherModal({ show, handleClose, voucherId, onSuccess }) {
  const [form, setForm] = useState(initialFormState());

  function initialFormState() {
    return {
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
      usage_count: '',
    };
  }

  const fetchVoucherDetail = async () => {
    try {
      const res = await axios.get(API_CONFIG.getApiUrl(`/voucher/${voucherId}`));
      const data = res.data;
      setForm({
        name: data.name,
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value?.toString() || '',
        min_order_value: data.min_order_value?.toString() || '',
        user_limit: data.user_limit?.toString() || '',
        usage_limit: data.usage_limit?.toString() || '',
        start_date: data.start_date?.slice(0, 16) || '',
        end_date: data.end_date?.slice(0, 16) || '',
        status: data.status,
        usage_count: data.usage_count,
      });
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết voucher:', err);
    }
  };

  useEffect(() => {
    if (show) {
      if (voucherId) fetchVoucherDetail();
      else setForm(initialFormState());
    }
  }, [show, voucherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'discount_value') {
      if (form.discount_type === 'percent') {
        let num = parseFloat(value.replace(/[^\d.]/g, '') || 0);
        if (num > 100) num = 100;
        setForm(prev => ({ ...prev, discount_value: num }));
      } else {
        let num = value.replace(/\D/g, '');
        setForm(prev => ({ ...prev, discount_value: num }));
      }
      return;
    }

    if (name === 'min_order_value') {
      let num = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, min_order_value: num }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Tên voucher không được để trống';
    if (!form.code.trim()) return 'Mã voucher không được để trống';
    if (!form.start_date || !form.end_date) return 'Vui lòng chọn ngày bắt đầu và kết thúc';
    if (new Date(form.start_date) > new Date(form.end_date)) return 'Ngày kết thúc phải sau ngày bắt đầu';
    return null;
  };

  const handleUpdate = async () => {
    const errMsg = validateForm();
    if (errMsg) return alert(`⚠️ ${errMsg}`);

    try {
      const payload = {
        ...form,
        discount_value: form.discount_type === 'percent'
          ? parseFloat(form.discount_value)
          : parseInt(form.discount_value),
        min_order_value: form.min_order_value ? parseInt(form.min_order_value) : null,
        user_limit: form.user_limit ? parseInt(form.user_limit) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      };

      await axios.put(API_CONFIG.getApiUrl(`/voucher/${voucherId}`), payload);
      toast.success("🎉 Cập nhật voucher thành công!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && message.includes("tồn tại")) alert(`⚠️ ${message}`);
      else toast.error('❌ Cập nhật thất bại, vui lòng thử lại sau!');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật Mã Giảm Giá</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FormAdd form={form} handleChange={handleChange} />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Hủy</Button>
        <Button variant="primary" onClick={handleUpdate}>Cập nhật</Button>
      </Modal.Footer>
    </Modal>
  );
}
