"use client";
import { useEffect } from "react";

export default function ProductOptions({
  attributes = [],
  skus = [],
  defaultPrice,
  defaultSalePrice,
  selectedValues = [],
  setSelectedValues,
  setSelectedPrice,
  setSelectedOriginalPrice,
  setSelectedSku,
  price,
  originalPrice,
  productStatus
}) {
  if (!attributes || attributes.length === 0) return null;

  // Hàm format giá tiền VND
  const formatPrice = (value) => {
    if (value == null || value === "") return "Đang cập nhật";
    const number = Number(value);
    if (isNaN(number)) return "Giá không hợp lệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(number);
  };

  useEffect(() => {
    if (!skus || skus.length === 0) return;

    const matchedSku = skus.find((sku) =>
      JSON.stringify(sku.option_combo.map((o) => o.id_value).sort()) ===
      JSON.stringify([...selectedValues].sort())
    );

    if (matchedSku) {
      setSelectedPrice(matchedSku.price_sale);
      setSelectedOriginalPrice(matchedSku.price);
      setSelectedSku(matchedSku);
    } else {
      setSelectedPrice(defaultSalePrice);
      setSelectedOriginalPrice(defaultPrice);
      setSelectedSku(null);
    }
  }, [selectedValues, skus]);

  const handleClickOption = (attrId, valId, attrName, attrType, valueNote) => {
    // Cập nhật giá trị được chọn
    const newSelected = [
      ...selectedValues.filter((id) => {
        const matchAttr = attributes.find((attr) =>
          attr.values.some(
            (val) => val.id_value === id && attr.id_attribute === attrId
          )
        );
        return !matchAttr;
      }),
      valId,
    ];

    setSelectedValues(newSelected);
  };

  return (
    <>
      {attributes.map((attr) => {
        const isColor = attr.type === 2;

        return (
          <div key={attr.id_attribute} className="mb-3">
            <div className="section-label">{isColor ? "Màu sắc" : attr.name}</div>
            <div className={isColor ? "color-options" : "storage-options"}>
              {attr.values.map((val) => {
                const isSelected = selectedValues.includes(val.id_value);
                return (
                  <button
                    key={val.id_value}
                    className={isSelected ? "active" : ""}
                    onClick={() =>
                      handleClickOption(
                        attr.id_attribute,
                        val.id_value,
                        attr.name,
                        attr.type,
                        val.value_note
                      )
                    }
                  >
                    {isColor ? (
                      <>
                        <span
                          className="color-dot"
                          style={{ background: val.value }}
                        ></span>
                        {val.value_note}
                      </>
                    ) : (
                      val.value
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
     <div
  className="price-display mt-3 d-flex align-items-baseline gap-3"
  id="priceDisplay"
>
  {productStatus == 4 ? (
    <span className="text-danger fw-bold fs-3">Giá dự kiến</span>
  ) : price && price > 0 ? (
    <>
      <span className="text-danger fw-bold fs-3">{formatPrice(price)}</span>
      {originalPrice && originalPrice > price && (
        <>
          <span className="text-muted text-decoration-line-through fs-5">
            {formatPrice(originalPrice)}
          </span>
          <span className="badge bg-danger">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        </>
      )}
    </>
  ) : (
    <span className="text-danger fw-bold fs-4">Hết hàng tạm thời</span>
  )}
</div>

    </>
  );
}
