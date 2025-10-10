
import React from 'react';
import { Button } from 'react-bootstrap';
import { useCompare } from '../../../contexts/CompareContext';

export default function CompareButton({ product, size = "sm", variant = "outline-info" }) {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare(product.id_products)) {
      removeFromCompare(product.id_products);
    } else {
      addToCompare(product);
    }
  };

  const isDisabled = !isInCompare(product.id_products) && !canAddMore();

  return (
    <Button
      variant={isInCompare(product.id_products) ? "danger" : variant}
      size={size}
      onClick={handleCompareClick}
      disabled={isDisabled}
      title={
        isDisabled 
          ? "Đã đạt giới hạn so sánh (2 sản phẩm)"
          : isInCompare(product.id_products) 
            ? "Xóa khỏi so sánh" 
            : "Thêm vào so sánh"
      }
      className="rounded-pill px-3"
    >
      {isInCompare(product.id_products) ? (
        <>⚖️ Đã chọn</>
      ) : (
        <>⚖️ So sánh</>
      )}
    </Button>
  );
}
