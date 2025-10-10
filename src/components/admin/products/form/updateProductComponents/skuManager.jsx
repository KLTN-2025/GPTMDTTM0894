import { useState } from "react";
import { Table, Form, Button, Alert } from "react-bootstrap";

function isHexColor(value) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

export default function SkuManager({ options = [], skuList = [], setSkuList }) {
  const [error, setError] = useState(null);

  if (options.length < 2) return null;

  const isComboExist = (comboToCheck, list) => {
    return list.some((sku) => {
      if (!sku.combo || sku.combo.length !== comboToCheck.length) return false;
      return comboToCheck.every((c, i) => sku.combo[i]?.value === c.value);
    });
  };

  const generateAllCombos = (opts) => {
    if (!opts.length) return [];
    const valuesList = opts.map((opt) => opt.values.map((v) => v.value));
    return valuesList.reduce((acc, curr) => {
      if (!acc.length) return curr.map((v) => [v]);
      return acc.flatMap((a) => curr.map((c) => [...a, c]));
    }, []);
  };

  const handleAddSku = () => {
    setError(null);
    const allCombos = generateAllCombos(options);
    const unusedCombos = allCombos.filter((comboValues) => {
      const comboObj = comboValues.map((val, i) => ({
        value: val,
        label: options[i].values.find((v) => v.value === val)?.label || val,
        optionName: options[i].name,
      }));
      return !isComboExist(comboObj, skuList);
    });

    if (!unusedCombos.length) {
      setError("Tất cả tổ hợp SKU đã được tạo, không thể thêm SKU mới.");
      return;
    }

    const comboToUse = unusedCombos[0].map((val, i) => {
      const option = options[i];
      const valueObj = option.values.find((v) => v.value == val || v.label == val); // tránh so sánh sai kiểu
      return {
        value: valueObj.value,
        label: valueObj.label || valueObj.value,
        optionName: option.name,
        id_value: valueObj.id_value || valueObj.id, // cần chính xác từ `options`
      };
    });

    const newSku = {
      combo: comboToUse,
      price: 0,
      price_sale: 0,
      quantity: 0,
      status: 2,
      sku_code: "",
    };

    setSkuList([...skuList, newSku]);
  };

  const handleComboChange = (skuIndex, optionIndex, newValue) => {
    setError(null);
    const updated = [...skuList];
    const option = options[optionIndex];
    const valueObj = option.values.find((v) => v.value === newValue);

    const newCombo = [...updated[skuIndex].combo];
    newCombo[optionIndex] = {
      value: newValue,
      label: valueObj?.label || newValue,
      optionName: option.name,
      id_value: valueObj?.id_value || valueObj?.id || null, // <-- thêm dòng này
    };

    // Kiểm tra combo trùng
    if (
      isComboExist(newCombo, skuList.filter((_, i) => i !== skuIndex)) ||
      newCombo.some((c) => !c.value)
    ) {
      setError("Tổ hợp không hợp lệ hoặc đã tồn tại.");
      return;
    }

    updated[skuIndex].combo = newCombo;
    setSkuList(updated);
  };

  const handleChange = (index, field, value) => {
    setError(null);
    const updated = [...skuList];
    updated[index][field] = value;
    setSkuList(updated);
  };

  const handleRemoveSku = (index) => {
    setError(null);
    const updated = [...skuList];
    updated.splice(index, 1);
    setSkuList(updated);
  };

  const allCombos = generateAllCombos(options);
  const unusedCombos = allCombos.filter((comboValues) => {
    const comboObj = comboValues.map((val, i) => ({
      value: val,
      label: options[i].values.find((v) => v.value === val)?.label || val,
      optionName: options[i].name,
    }));
    return !isComboExist(comboObj, skuList);
  });

  const canAddSku = unusedCombos.length > 0;

  const formatCurrency = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseCurrency = (formatted) => {
    return parseInt(formatted.replace(/\./g, "")) || 0;
  };


  return (
    <div className="mt-4">
      <h5>Quản lý SKU theo tổ hợp option</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="success" size="sm" onClick={handleAddSku} disabled={!canAddSku}>
        <i className="bi bi-plus-lg"></i> Thêm SKU
      </Button>

      <Table bordered size="sm" responsive className="mt-2">
        <thead>
          <tr>
            {options.map((opt, idx) => <th key={idx}>{opt.name}</th>)}
            <th>Giá bán</th>
            <th>Giá thị trường</th>
            <th>Số lượng</th>
            {/* <th>SKU Code</th> */}
            <th>Trạng thái</th>
            <th>Xoá</th>
          </tr>
        </thead>
        <tbody>
          {skuList.length > 0 ? skuList.map((skuItem, index) => (
            <tr key={index}>
              {skuItem.combo.map((c, i) => {
                const opt = options[i];
                const isColor = isHexColor(c.value);
                return (
                  <td key={i}>
                    <div className="d-flex align-items-center">
                      <Form.Select
                        size="sm"
                        value={c.value}
                        onChange={(e) => handleComboChange(index, i, e.target.value)}
                      >
                        <option value="">-- Chọn {opt.name} --</option>
                        {opt.values.map((v, j) => {
                          const testCombo = [...skuItem.combo];
                          testCombo[i] = {
                            value: v.value,
                            label: v.label,
                            optionName: opt.name,
                            id_value: v.id_value || v.id,
                          };
                          const comboExisted = isComboExist(
                            testCombo,
                            skuList.filter((_, idx) => idx !== index)
                          );
                          return (
                            <option key={j} value={v.value} disabled={comboExisted}>
                              {v.value}
                            </option>
                          );
                        })}
                      </Form.Select>
                      {isColor && (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: c.value,
                            border: "1px solid #ccc",
                            marginLeft: 6,
                            borderRadius: 3,
                          }}
                          title={c.label}
                        />
                      )}
                    </div>
                  </td>
                );
              })}
              <td>
                <Form.Control
                  type="text"
                  value={formatCurrency(skuItem.price)}
                  onChange={(e) => handleChange(index, "price", parseCurrency(e.target.value))}
                  size="sm"
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={formatCurrency(skuItem.price_sale)}
                  onChange={(e) => handleChange(index, "price_sale", parseCurrency(e.target.value))}
                  size="sm"
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={skuItem.quantity}
                  onChange={(e) => handleChange(index, "quantity", parseInt(e.target.value) || 0)}
                  size="sm"
                />
              </td>
              <td>
                <Form.Select
                  value={skuItem.status}
                  onChange={(e) => handleChange(index, "status", parseInt(e.target.value))}
                  size="sm"
                >
                  <option value={2}>Hiển thị</option>
                  <option value={1}>Ẩn</option>
                </Form.Select>
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleRemoveSku(index)}>
                  <i className="bi bi-trash" />
                </Button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={options.length + 5} className="text-center text-muted">
                Chưa có SKU nào
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
