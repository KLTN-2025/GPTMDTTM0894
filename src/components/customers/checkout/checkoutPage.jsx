"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import CheckoutInfo from "./modal/checkoutInfo";
import CheckoutCart from "./modal/checkoutCart";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import API_CONFIG from "@/config/api";

export default function CheckoutPage({ idCustomer }) {
  const [addresses, setAddresses] = useState([]);
  // const [newAddress, setNewAddress] = useState([]);
  const [note, setNote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(1); // cod = 1, online = 2
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const router = useRouter();

  const [newAddress, setNewAddress] = useState({
    name_address: "",
    name_ward: "",
    name_city: "",
  });

  const handleTotalChange = (value) => {
    setTotalAmount(value);
  };

  // Load applied voucher from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedVoucher = localStorage.getItem('appliedVoucher');
      if (savedVoucher) {
        setAppliedVoucher(JSON.parse(savedVoucher));
      }
    } catch (error) {
      console.error('Error loading voucher from localStorage:', error);
    }
  }, []);

  // Load user info
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const customerId = idCustomer || localStorage.getItem("id_customer");

    if (!token || !customerId) {
      setLoadingUser(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(API_CONFIG.getApiUrl(`/customers/${customerId}`), { headers });
        const c = res.data.customer;
        setUserInfo({
          name: `${c.last_name} ${c.given_name}`,
          email: c.email,
          phone: c.phone,
        });
      } catch (err) {
        console.error("Lỗi khi fetch thông tin người dùng:", err);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [idCustomer]);

  // Load cart items
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const customerId = idCustomer || localStorage.getItem("id_customer");

    if (!token || !customerId) {
      toast.error("Bạn cần đăng nhập để tiếp tục!");
      setLoadingCart(false);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const cartRes = await axios.get(
          API_CONFIG.getApiUrl(`/cart/customer/${customerId}`),
          { headers }
        );
        const raw = cartRes.data;
        const cartData = Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.items)
            ? raw.items
            : Array.isArray(raw)
              ? raw
              : [];
        setCartItems(cartData);
      } catch (err) {
        console.error("Lỗi khi fetch giỏ hàng:", err);
        toast.error("Có lỗi khi tải giỏ hàng");
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartItems();
  }, [idCustomer]);

  // Load addresses
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const customerId = idCustomer || localStorage.getItem("id_customer");

    if (!token || !customerId) {
      setLoadingAddress(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const addrRes = await axios.get(
          API_CONFIG.getApiUrl(`/address/customer/${customerId}`),
          { headers }
        );

        const addressesData = Array.isArray(addrRes.data.data)
          ? addrRes.data.data
          : [];
        setAddresses(addressesData);
        setSelectedAddress(addressesData.find((a) => a.is_primary) || null);
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("Không có địa chỉ nào cho khách hàng.");
          setAddresses([]);
          setSelectedAddress(null);
        } else {
          console.error("Lỗi khi fetch địa chỉ:", err);
          toast.error("Có lỗi khi tải địa chỉ");
        }
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [idCustomer]);

  const handleCheckout = async () => {
    if (!userInfo) {
      toast.error("Thông tin người dùng không hợp lệ.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Bạn chưa chọn địa chỉ giao hàng.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để tiếp tục.");
        setSubmitting(false);
        return;
      }

      const address = `${newAddress.name_address}, ${newAddress.name_ward}, ${newAddress.name_city}`;

      const dataToSend = {
        id_customer: idCustomer || localStorage.getItem("id_customer"),
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
        address: address,
        payment_method: paymentMethod, // 1 hoặc 2
        cart_items: cartItems.map(item => {
          const optionDesc = item.attribute_values?.map(attr => {
            const attrValue = attr.attribute_value;
            const attribute = attrValue?.attribute;
            if (!attrValue || !attribute) return null;

            const type = Number(attribute.type);
            return type === 2 ? attrValue.value_note || attrValue.value : attrValue.value || "";
          }).filter(Boolean).join(", ") || "";

          return {
            id_product: item.id_product,
            quantity: item.quantity,
            price: item.price,
            attribute_values: item.attribute_values,
            attribute_value_ids: item.attribute_value_ids || [],
            id_variant: item.id_variant,
            products_item: optionDesc,
          };
        }),
        note,
        total_amount: totalAmount,
      };

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(API_CONFIG.getApiUrl("/order/checkout"), dataToSend, { headers });

      if (paymentMethod === 2 && res.data.payUrl) {
        console.log(res.data.payUrl);
        window.location.href = res.data.payUrl;
      } else {
        toast.success("Đặt hàng thành công!");
        localStorage.removeItem('appliedVoucher');
        router.push(`/thankyou?order_id=${res.data.order_id}`);
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      toast.error(error.response?.data?.message || "Lỗi khi đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart || loadingAddress || loadingUser) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={7}>
          <Card className="p-3 mb-3 shadow-sm border-0">
            <CheckoutInfo
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              note={note}
              setNote={setNote}
            />
          </Card>
        </Col>
        <Col md={5}>
          <Card className="p-3 mb-3 shadow-sm border-0 d-flex flex-column">
            <CheckoutCart
              cartItems={cartItems}
              onCheckout={handleCheckout}
              submitting={submitting}
              onTotalChange={handleTotalChange}
              appliedVoucher={appliedVoucher}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
