"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

function formatPrice(price) {
  if (!price) return "";
  const numberPrice = Number(price);
  if (isNaN(numberPrice)) return price;
  return numberPrice.toLocaleString("vi-VN") + " ₫";
}

const normalize = (str) => str.trim().toLowerCase();

const generateComboKey = (selectedOptions) =>
  Object.entries(selectedOptions)
    .map(([k, v]) => `${normalize(k)}:${normalize(v)}`)
    .sort()
    .join("|");

const makeComboKeyFromOptionCombo = (optionCombo) =>
  optionCombo
    .map(({ attribute, value }) => `${normalize(attribute)}:${normalize(value)}`)
    .sort()
    .join("|");

export default function BasicInfo({
  name,
  price,
  originalPrice,
  attributes = [],
  variants = [],
  onColorChange,
  id_product,
  id_customer,
}) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Cập nhật selectedVariant dựa trên selectedOptions
  useEffect(() => {
    const comboKey = generateComboKey(selectedOptions);
    console.log("🔹 Generated comboKey:", comboKey);

    const variantMap = variants.reduce((acc, v) => {
      const key = makeComboKeyFromOptionCombo(v.option_combo);
      acc[key] = v;
      return acc;
    }, {});

    console.log("🔹 Variant Map keys:", Object.keys(variantMap));

    setSelectedVariant(variantMap[comboKey] || null);
  }, [selectedOptions, variants]);

  // Mặc định chọn option đầu tiên
  useEffect(() => {
    if (attributes.length && Object.keys(selectedOptions).length === 0) {
      const defaults = {};
      attributes.forEach((attr) => {
        if (attr.values.length > 0) {
          defaults[attr.name] = attr.values[0].value;
        }
      });
      setSelectedOptions(defaults);
    }
  }, [attributes]);

  const handleOptionChange = (attributeName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeName]: value,
    }));

    if (attributeName.toLowerCase() === "màu" && onColorChange) {
      onColorChange(value);
    }
  };

  const handleAddToCart = async () => {
    if (!id_customer) {
       toast.warn("Vui lòng đăng nhập để sử dụng giỏ hàng.");
      return;
    }

    if (!selectedVariant) {
      toast.warn("Vui lòng chọn đầy đủ các tuỳ chọn sản phẩm.");
      return;
    }

    const attribute_value_ids = selectedVariant.option_combo.map(
      (item) => item.id_value
    );

    try {
      const response = await axios.post(API_CONFIG.getApiUrl("/cart/add"), {
        id_customer,
        id_product,
        quantity,
        attribute_value_ids,
      });

      // axios tự động throw nếu status không phải 2xx nên nếu tới đây là thành công
        toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      // Lấy message lỗi từ response của backend nếu có
      const msg =
        toast.error(err?.response?.data?.message || "Lỗi khi thêm vào giỏ hàng.");
      alert(msg);
    }
  };

  return (
    <div className="col-lg-7 mt-4 h-100">
      <div className="card h-100">
        <div className="card-body d-flex flex-column justify-content-between">
          <h1 className="h2">{name}</h1>

          <p className="h3 py-2 text-success">
            {selectedVariant
              ? formatPrice(selectedVariant.price)
              : formatPrice(price)}
          </p>

          {originalPrice && (
            <p className="text-muted text-decoration-line-through">
              {formatPrice(originalPrice)}
            </p>
          )}

          {attributes.map((attr) => (
            <div className="mb-3" key={attr.name}>
              <h6 className="fw-bold">{attr.name}</h6>
              <div className="d-flex flex-wrap gap-2">
                {attr.values.map((val) => {
                  const isSelected = selectedOptions[attr.name] === val.value;
                  const isColorOption = attr.name.toLowerCase() === "màu";
                  return (
                    <button
                      key={val.value}
                      className={`btn btn-sm p-0 ${
                        isSelected
                          ? "border border-3 border-success"
                          : "border border-1 border-secondary"
                      }`}
                      onClick={() => handleOptionChange(attr.name, val.value)}
                      style={{
                        backgroundColor: isColorOption ? val.value : undefined,
                        width: 40,
                        height: 40,
                        borderRadius: isColorOption ? "50%" : undefined,
                        cursor: "pointer",
                      }}
                      title={isColorOption ? val.value : ""}
                    >
                      {!isColorOption && val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="row mb-3">
            <div className="col-auto">
              <h6>Số lượng:</h6>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="badge bg-secondary">{quantity}</span>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            {selectedVariant && (
              <div className="col-auto d-flex align-items-end">
                <span className="text-muted">
                  (Còn {selectedVariant.quantity} sản phẩm)
                </span>
              </div>
            )}
          </div>

          <div className="row pb-3">
            <div className="col d-grid">
              <a href="https://zalo.me/0777527125" className="btn btn-success btn-lg">Liên Hệ</a>
            </div>
            <div className="col d-grid">
              <button
                className="btn btn-outline-success btn-lg"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
