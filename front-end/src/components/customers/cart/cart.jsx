'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import ContactWarningModal from "./Modal/Contact";
import CartList from "./CartComponents/cartList";
import CartTotal from "./CartComponents/cartTotal";
import Link from "next/link";
import { toast } from "react-toastify";

export default function CartWrapper() {
  const [cartItems, setCartItems] = useState([]);
  const [token, setToken] = useState(null);
  const [idCustomer, setIdCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showContactModal, setShowContactModal] = useState(false);
  
  const toastId = "update-quantity-toast";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("id_customer");

    setToken(storedToken);
    setIdCustomer(storedId);

    if (storedToken && storedId) {
      axios
        .get(`http://localhost:5000/api/cart/customer/${storedId}`)
        .then((res) => {
          setCartItems(res.data.items || []);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy giỏ hàng:", err);
          toast.error("Lỗi khi lấy giỏ hàng");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  
  const handleUpdateQuantity = async (idCartItem, newQuantity) => {
    const idCustomer = localStorage.getItem("id_customer");

    const itemToUpdate = cartItems.find((item) => item.id_cart_items === idCartItem);
    if (!itemToUpdate || !idCustomer) return;

    try {
      await axios.put(`http://localhost:5000/api/cart/update/${idCustomer}`, {
        id_cart_items: idCartItem,
        id_product: itemToUpdate.id_product,
        attribute_value_ids: itemToUpdate.attribute_values.map(
          (attr) => Number(attr.attribute_value.id_value)
        ),
        quantity: newQuantity,
      });

      // cập nhật state sau khi update thành công
      const updated = cartItems.map((item) =>
        item.id_cart_items === idCartItem ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updated);

      if (!toast.isActive(toastId)) {
        toast.success("Cập nhật số lượng thành công", { toastId });
      }

    } catch (error) {
      console.error("❌ Lỗi khi cập nhật số lượng:", error.response?.data || error.message);

      if (!toast.isActive(toastId)) {
        toast.error("Lỗi khi cập nhật số lượng", { toastId });
      }
      
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const handleDeleteItem = async (idCartItem) => {
    if (!idCustomer) {
      toast.error("Bạn cần đăng nhập để xóa sản phẩm");
      return;
    }

    try {
      const res = await axios.delete(`http://localhost:5000/api/cart/delete/${idCustomer}`, {
        data: { id_cart_items: idCartItem },
      });

      // Cập nhật lại state loại bỏ item đã xóa
      setCartItems((prev) => prev.filter((item) => item.id_cart_items !== idCartItem));
      toast.success(res.data.message || "Xóa sản phẩm khỏi giỏ thành công");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error.response?.data || error.message);
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;

  if (!token || !idCustomer) {
    return (
      <div className="container mt-5 mb-5 d-flex justify-content-center">
        <div
          className="p-4 border rounded shadow-sm text-center"
          style={{ maxWidth: 500, width: "100%" }}
        >
          <h4 className="mb-3 text-danger">
            Vui lòng đăng nhập hoặc đăng ký để sử dụng giỏ hàng
          </h4>
          <Link href="/register" className="btn btn-primary w-100 mb-2">
            Đăng ký ngay
          </Link>
          <Link href="/login" className="btn btn-outline-secondary w-100">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h3 className="mb-4 text-center">Giỏ hàng</h3>
      <div className="row">
        <div className="col-lg-8 mb-4">
          <CartList
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteItem={handleDeleteItem} // truyền hàm xóa xuống con
            
          />
        </div>

        <div className="col-lg-4">
          <CartTotal 
          items={cartItems} 
          onShowContactModal={() => setShowContactModal(true)} // thêm prop này
          />
        </div>

        <ContactWarningModal
          show={showContactModal}
          onHide={() => setShowContactModal(false)}
        />
        
      </div>
    </div>
  );
}
