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
          <Button onClick={addOption} disabled={options.length >= 2}>Thêm Option</Button>
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
