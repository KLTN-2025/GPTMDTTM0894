import React, { useState } from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

export default function OptionsManager({ options, setOptions }) {
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionType, setNewOptionType] = useState(1);

  const addOption = () => {
    if (!newOptionName.trim()) return;
    setOptions(prev => [...prev, {
      name: newOptionName,
      type: Number(newOptionType),
      values: [],
    }]);
    setNewOptionName('');
    setNewOptionType('text');
  };

  const addValue = (i) => {
    const updated = [...options];
    updated[i].values.push({
      label: '',
      value_note: '',
      extraPrice: 0,
      quantity: 0,
      status: 2,
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
    const images = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isMain: 2,
    }));
    const updated = [...options];
    updated[i].values[j].images = [...(updated[i].values[j].images || []), ...images];
    setOptions(updated);
  };

  const handleToggleMainValueImage = (i, j, k) => {
    const updated = [...options];
    updated[i].values[j].images.forEach(img => img.isMain = 2);
    updated[i].values[j].images[k].isMain = 1;
    setOptions(updated);
  };

  const handleRemoveValueImage = (i, j, k) => {
    const updated = [...options];
    updated[i].values[j].images.splice(k, 1);
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
            placeholder="Tên option"
          />
        </Col>
        <Col sm={3}>
          <Form.Select
          value={newOptionType}
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
                onChange={(e) => updateOption(i, 'name', e.target.value)}
                placeholder="Tên option"
              />
            </Col>
            <Col sm="auto">
              {options.length > 0 && (
                <Button variant="danger" size="sm" onClick={() => removeOption(i)}>Xoá</Button>
              )}
            </Col>
          </Row>

          <Table bordered size="sm" responsive>
            <thead>
              <tr>
                <th>Giá trị</th>
                <th>+Giá</th>
                <th>SL</th>
                <th>Trạng thái</th>
                <th>Ảnh</th>
                <th>Xoá</th>
              </tr>
            </thead>
            <tbody>
              {option.values.map((val, j) => (
                <tr key={j}>
                  <td>
                    {option.type === 2 ? (
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="color"
                          value={val.label || '#000000'}
                          onChange={(e) => updateValue(i, j, 'label', e.target.value)}
                          style={{ width: 50, height: 38, padding: 2 }}
                        />
                        <span>{val.label}</span>
                        </div>
                        <Form.Control
                          type="text"
                          value={val.value_note || ''}
                          placeholder="Tên màu"
                          onChange={(e) => updateValue(i, j, 'value_note', e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    ) : (
                      <Form.Control
                        value={val.label}
                        onChange={(e) => updateValue(i, j, 'label', e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={val.extraPrice}
                      min={0}
                      onChange={(e) => updateValue(i, j, 'extraPrice', +e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={val.quantity}
                      onChange={(e) => updateValue(i, j, 'quantity', +e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Select
                      value={val.status}
                      onChange={(e) => updateValue(i, j, 'status', +e.target.value)}
                    >
                      <option value={2}>Hiển thị</option>
                      <option value={1}>Ẩn</option>
                    </Form.Select>
                  </td>
                  <td style={{ minWidth: 240 }}>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleUploadValueImage(e, i, j)}
                    />
                    <div
                      className="d-flex flex-wrap gap-2 mt-2"
                      style={{ maxWidth: '100%' }}
                    >
                      {val.images?.map((img, k) => (
                        <div
                          key={k}
                          style={{ width: '70px', textAlign: 'center' }}
                        >
                          <img
                            src={img.url}
                            className="img-thumbnail"
                            style={{
                              width: '100%',
                              height: '70px',
                              objectFit: 'cover',
                              border: img.isMain === 1 ? '2px solid #198754' : '1px solid #ccc',
                              borderRadius: '6px',
                            }}
                          />
                          <Button
                            size="sm"
                            variant={img.isMain === 1 ? 'success' : 'outline-secondary'}
                            className="mt-1 w-100 p-1"
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleToggleMainValueImage(i, j, k)}
                          >
                            {img.isMain === 1 ? 'Đại diện' : 'Ghim'}
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
                    <Button size="sm" variant="danger" onClick={() => removeValue(i, j)}>
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
