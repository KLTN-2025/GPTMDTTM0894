import { useState, useEffect } from "react";

export default function ProductActions({ 
  onBuyNow, 
  onAddToCart, 
  quantity,
  setQuantity, 
  selectedSku
}) {
  const [showNotice, setShowNotice] = useState("");

  const stockQty = selectedSku?.quantity || 0;
  const isDisabledQty = !selectedSku || stockQty <= 0;

  // Cập nhật thông báo khi quantity thay đổi
  useEffect(() => {
    if (quantity > stockQty && stockQty > 0) {
      setShowNotice(`Chỉ còn ${stockQty} sản phẩm trong kho.`);
    } else if (quantity >= 10) {
      setShowNotice("Nếu mua trên 10 sản phẩm vui lòng liên hệ cửa hàng.");
    } else {
      setShowNotice("");
    }
  }, [quantity, stockQty]);

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };

  // Disable nút mua nếu:
  //  - Không có hàng
  //  - Quantity > tồn kho
  //  - Quantity >= 10
  const disableBuy = isDisabledQty || quantity > stockQty || quantity >= 10;

  return (
    <>
      <div className="quantity-wrapper">
        <button 
          type="button" 
          className="btn-qty" 
          onClick={handleDecrease} 
          disabled={isDisabledQty}
        >
          –
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="input-qty"
          disabled={isDisabledQty}
        />
        <button 
          type="button" 
          className="btn-qty" 
          onClick={handleIncrease}
          disabled={isDisabledQty}
        >
          +
        </button>
      </div>

      {showNotice && (
        <div style={{ fontSize: "0.85rem", color: "#d9534f", marginTop: "4px" }}>
          {showNotice}
        </div>
      )}

      <div className="cta d-flex gap-2 mt-2">
        <button
          className="btn btn-primary flex-fill"
          onClick={() => onBuyNow && onBuyNow(quantity)}
          disabled={disableBuy}
        >
          Mua ngay
        </button>

        <button
          className="btn btn-secondary flex-fill"
          onClick={() => onAddToCart && onAddToCart()}
          disabled={disableBuy}
        >
          Thêm vào giỏ
        </button>
      </div>
    </>
  );
}
