import { useEffect } from "react";
import { Table, Form, Button } from "react-bootstrap";

function isHexColor(value) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

function getOptionCombinations(optionValues) {
  if (optionValues.length === 0) return [];
  return optionValues.reduce((acc, curr) => {
    const result = [];
    acc.forEach((a) => {
      curr.forEach((c) => {
        result.push([...a, c]);
      });
    });
    return result;
  }, [[]]);
}

function isSameSkuList(listA, listB) {
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    if (JSON.stringify(listA[i]) !== JSON.stringify(listB[i])) {
      return false;
    }
  }
  return true;
}

export default function SkuManager({ options = [], skuList, setSkuList }) {
  useEffect(() => {
    if (options.length >= 2) {
      const valuesList = options.map(opt =>
        opt.values.map(v => ({
          // id_value: v.id_value,
          label: v.label,
          value: v.value || v.label,
          optionName: opt.name,
        }))
      );

      const combinations = getOptionCombinations(valuesList);

      const newSkus = combinations.map(combo => {
        const existingSku = skuList.find(sku => {
          if (!sku.combo) return false;
          if (sku.combo.length !== combo.length) return false;
          return sku.combo.every((item, idx) => item.value === combo[idx].value);
        });

        return {
          combo,
          price: existingSku ? existingSku.price : 0,
          price_sale: existingSku ? existingSku.price_sale : 0,
          quantity: existingSku ? existingSku.quantity : 0,
          status: existingSku ? existingSku.status : 2,
          main_image_index: existingSku?.main_image_index ?? null,
        };
      });

      if (!isSameSkuList(newSkus, skuList)) {
        setSkuList(newSkus);
      }
    } else {
      if (skuList.length !== 0) {
        setSkuList([]);
      }
    }
  }, [options]);

  const handleChange = (i, field, value) => {
    const updated = [...skuList];
    updated[i][field] = value;
    setSkuList(updated);
  };

  if (options.length < 2) return null;

  return (
    <div className="mt-4">
      <h5>Quản lý SKU theo tổ hợp option</h5>
      <Table bordered size="sm" responsive>
        <thead>
          <tr>
            {options.map((opt, idx) => (
              <th key={idx}>{opt.name}</th>
            ))}
            <th>Giá thị trường</th>
            <th>Giá bán</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            {/* <th>SKU</th> Nếu muốn ẩn hẳn luôn cột SKU */}
            <th>Xoá</th>
          </tr>
        </thead>
        <tbody>
          {skuList.map((skuItem, index) => (
            <tr key={index}>
              {skuItem.combo.map((c, i) => (
                <td key={i}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {isHexColor(c.value) && (
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: c.value,
                          border: "1px solid #ccc",
                          marginRight: 8,
                          borderRadius: 3,
                        }}
                        title={c.label}
                      />
                    )}
                    <span>{c.label}</span>
                  </div>
                </td>
              ))}
              <td>
                <Form.Control
                  type="number"
                  min={0}
                  value={skuItem.price}
                  onChange={(e) =>
                    handleChange(index, "price", parseInt(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  min={0}
                  value={skuItem.price_sale}
                  onChange={(e) =>
                    handleChange(index, "price_sale", parseInt(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  min={0}
                  value={skuItem.quantity}
                  onChange={(e) =>
                    handleChange(index, "quantity", parseInt(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Form.Select
                  value={skuItem.status}
                  onChange={(e) =>
                    handleChange(index, "status", parseInt(e.target.value))
                  }
                >
                  <option value={2}>Hiển thị</option>
                  <option value={1}>Ẩn</option>
                </Form.Select>
              </td>
              {/* Nếu vẫn muốn hiển thị SKU (readonly hoặc dummy) thì bật lại:
              <td>
                <Form.Control value={skuItem.sku || 'Sẽ tạo ở BE'} disabled readOnly />
              </td>
              */}
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const updated = [...skuList];
                    updated.splice(index, 1);
                    setSkuList(updated);
                  }}
                >
                  <i className="bi bi-trash" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
