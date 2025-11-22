import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input-field';
import { Trash } from 'react-bootstrap-icons';

export default function OptionsManager({ options, setOptions, skuManagedOptions }) {
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionType, setNewOptionType] = useState('');

  const isOptionLocked = (option) => {
    // Kiểm tra bằng id_attribute hoặc name tùy bạn
    return skuManagedOptions.some(
      (locked) => locked === option.id_attribute || locked === option.name
    );
  };
 
  // Cleanup URL object khi component unmount
  useEffect(() => {
    return () => {
      options.forEach(option => {
        option.values.forEach(value => {
          (value.images || []).forEach(img => {
            if (img.url && img.file) {
              URL.revokeObjectURL(img.url);
            }
          });
        });
      });
    };
  }, [options]);

  const addOption = () => {
    if (!newOptionName.trim()) return;
    setOptions(prev => [...prev, {
      id_attribute: null,
      name: newOptionName,
      type: Number(newOptionType) || 1,
      values: [],
    }]);
    setNewOptionName('');
    setNewOptionType(1);
  };

  const addValue = (i) => {
    const updated = [...options];
    updated[i].values.push({
      id_value: null,
      // idProductAttrVal: null,
      value: '',
      value_note:'',
      extraPrice: 0,
      quantity: 0,
      status: 1,
      images: [],
    });
    setOptions(updated);
  };

  const updateOption = (i, key, value) => {
    const updated = [...options];
    updated[i][key] = value;
    setOptions(updated);
  };

  const updateValue = (i, j, key, value) => {
    const updated = [...options];
    updated[i].values[j][key] = value;
    setOptions(updated);
  };

  const handleUploadValueImage = (e, i, j) => {
    const files = Array.from(e.target.files);

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isMain: false,
      fromServer: false,
    }));

      setOptions(prevOptions => {
      const updated = [...prevOptions];

      const option = { ...updated[i] };
      const value = { ...option.values[j] };

      const existingImages = Array.isArray(value.images) ? [...value.images] : [];
      const mergedImages = [...existingImages, ...newImages];

      // Nếu chưa có ảnh đại diện thì chọn ảnh đầu tiên làm main
      if (!mergedImages.some(img => img.isMain === true) && mergedImages.length > 0) {
        mergedImages[0].isMain = true;
      }

      value.images = mergedImages;
      option.values = [...option.values];
      option.values[j] = value;
      updated[i] = option;

      return updated;
    });
  };

  //   const updated = [...options];
  //   const targetImages = updated[i].values[j].images || [];

  //   const mergedImages = [...targetImages, ...newImages];

  //   // Nếu chưa có ảnh đại diện => chọn ảnh đầu tiên làm main
  //   if (!mergedImages.some(img => img.isMain === true) && mergedImages.length > 0) {
  //     mergedImages[0].isMain = true;
  //   }

  //   updated[i].values[j].images = mergedImages;
  //   setOptions(updated);
  // };

  const handleToggleMainValueImage = (i, j, k) => {
    const updated = [...options];
    updated[i].values[j].images = updated[i].values[j].images.map((img, idx) => ({
      ...img,
      isMain: idx === k,
    }));
    setOptions(updated);
  };

  const handleRemoveValueImage = (i, j, k) => {
    const updated = [...options];
    const valueImages = updated[i].values[j].images;

    const removed = valueImages[k];
    if (removed?.url && removed?.file) {
      URL.revokeObjectURL(removed.url);
    }

    valueImages.splice(k, 1);

    if (!valueImages.some(img => img.isMain === true) && valueImages.length > 0) {
      valueImages[0].isMain = true;
    }

    console.log('Còn lại ảnh option:', valueImages);
    setOptions(updated);
  }; 


  const removeOption = (i) => {
    const updated = [...options];
    updated.splice(i, 1);
    setOptions(updated);
  };

  const removeValue = (i, j) => {
    const updated = [...options];
    updated[i].values.splice(j, 1);
    setOptions(updated);
  };

  return (
    <div className="mb-4">
      <h5 className="fw-bold">Quản lý Option sản phẩm</h5>
      <Row className="mb-3">
        <Col sm={4}>
          <Form.Control
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            placeholder="Tên option (VD: Màu sắc)"
          />
        </Col>
        <Col sm={3}>
          <Form.Select
            value={newOptionType || 1}
            onChange={(e) => setNewOptionType(e.target.value)}
          >
            <option value={1}>Chữ</option>
            <option value={2}>Màu</option>
          </Form.Select>
        </Col>
        <Col sm="auto">
          <Button onClick={addOption}>Thêm Option</Button>
        </Col>
      </Row>

      {options.map((option, i) => (
        <div key={i} className="border p-3 rounded mb-3">
          <Row className="mb-2">
            <Col>
              <Form.Control
                value={option.name}
                onChange={(e) => !isOptionLocked(option) && updateOption(i, 'name', e.target.value)}
                placeholder="Tên option"
                disabled={isOptionLocked(option)}
              />
            </Col>
            <Col sm="auto">
              {options.length > 0 && (
                <Button 
                variant="danger" 
                size="sm" 
                onClick={() => !isOptionLocked(option) && removeOption(i)}
                disabled={isOptionLocked(option)}
                >
                Xoá
                </Button>
              )}
            </Col>
          </Row>

          <Table bordered size="sm" responsive>
            <thead>
              <tr>
                <th>Giá trị</th>
                <th>Giá bán</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Ảnh</th>
                <th>Xoá</th>
              </tr>
            </thead>
            <tbody>
              {option.values.map((val, j) => (
                <tr key={j}>
                  <td>
                    {Number(option.type) === 2 ? (
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <Form.Control
                            type="color"
                            value={val.value || '#000000'}
                            onChange={(e) => !isOptionLocked(option) && updateValue(i, j, 'value', e.target.value)}
                            title={val.label}
                            style={{ width: 50, height: 50 }}
                            disabled={isOptionLocked(option)}
                          />
                          <span>{val.value}</span>
                        </div>
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên màu"
                          value={val.value_note || ''}
                          onChange={(e) => !isOptionLocked(option) && updateValue(i, j, 'value_note', e.target.value)}
                          disabled={isOptionLocked(option)}
                        />
                      </div>
                    ) : (
                      <Form.Control
                        value={val.value}
                        onChange={(e) => !isOptionLocked(option) && updateValue(i, j, 'value', e.target.value)}
                        disabled={isOptionLocked(option)}
                      />
                    )}
                  </td>
                  <td>
                    <CurrencyInput
                      intlConfig={{ locale: 'vi-VN', currency: 'VND' }}
                      allowNegativeValue={false}
                      decimalsLimit={0}
                      value={val.extraPrice}
                      onValueChange={value =>
                        updateValue(i, j, 'extraPrice', value ?? 0)
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min={0}
                      value={val.quantity}
                       onChange={(e) => updateValue(i, j, 'quantity', Number(e.target.value))} // Ép kiểu số
                    />
                  </td>
                  <td>
                    <Form.Select
                      value={val.status ? 1 : 0}
                      onChange={(e) => updateValue(i, j, 'status', Number(e.target.value))} // Ép kiểu số
                    >
                      <option value={1}>Hiển thị</option>
                      <option value={0}>Ẩn</option>
                    </Form.Select>
                  </td>
                  <td style={{ minWidth: 240 }}>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleUploadValueImage(e, i, j)}
                    />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {val.images?.map((img, k) => (
                        <div key={k} style={{ width: '70px', textAlign: 'center' }}>
                          <img
                            src={img.url}
                            className="img-thumbnail"
                            style={{
                              width: '100%',
                              height: '70px',
                              objectFit: 'cover',
                              border: img.isMain ? '2px solid #198754' : '1px solid #ccc',
                              borderRadius: '6px',
                            }}
                          />
                          <Button
                            size="sm"
                            variant={img.isMain ? 'success' : 'outline-secondary'}
                            className="mt-1 w-100 p-1"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleToggleMainValueImage(i, j, k)}
                          >
                            {img.isMain ? 'Đại diện' : 'Ghim'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="mt-1 w-100 p-1"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleRemoveValueImage(i, j, k)}
                          >
                            Xoá
                          </Button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Button size="sm" variant="danger" onClick={() => removeValue(i, j)} disabled={isOptionLocked(option)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button variant="outline-primary" size="sm" onClick={() => addValue(i)}>
            Thêm giá trị
          </Button>
        </div>
      ))}
    </div>
  );
}