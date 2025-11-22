"use client";
import { Form, Card } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function CheckoutInfo({
  userInfo,
  setUserInfo,
  addresses = [],         // danh sách địa chỉ user
  selectedAddress,
  newAddress,
  setNewAddress,
  setSelectedAddress,
  paymentMethod,
  setPaymentMethod,
  note,
  setNote
}) {
  // State địa chỉ để sửa, đồng nhất tên trường với dữ liệu addresses
  // const [newAddress, setNewAddress] = useState({
  //   name_address: "",
  //   name_ward: "",
  //   name_city: "",
  // });

  // Khi addresses hoặc selectedAddress thay đổi, set selected và newAddress mặc định
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = selectedAddress || addresses.find(a => a.is_primary === 1) || addresses[0];
      setSelectedAddress(defaultAddress);

      if (defaultAddress) {
        setNewAddress({
          name_address: defaultAddress.name_address || "",
          name_ward: defaultAddress.name_ward || "",
          name_city: defaultAddress.name_city || "",
        });
      }
    }
  }, [addresses, selectedAddress, setSelectedAddress]);

  // Cập nhật thông tin khách hàng
  const handleChangeUser = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cập nhật form địa chỉ (các input)
  const handleChangeNewAddress = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Khi chọn 1 địa chỉ từ danh sách, cập nhật selected và đổ dữ liệu lên form địa chỉ
  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setNewAddress({
      name_address: addr.name_address || "",
      name_ward: addr.name_ward || "",
      name_city: addr.name_city || "",
    });
  };

  return (
    <div>
      {/* Thông tin khách hàng */}
      {userInfo && (
        <>
          <h5>Thông tin khách hàng</h5>

          <Form.Group className="mb-2">
            <Form.Label>Họ và tên</Form.Label>
            <Form.Control
              type="text"
              value={userInfo.name || ""}
              onChange={(e) => handleChangeUser("name", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={userInfo.email || ""}
              onChange={(e) => handleChangeUser("email", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="tel"
              value={userInfo.phone || ""}
              onChange={(e) => handleChangeUser("phone", e.target.value)}
            />
          </Form.Group>
        </>
      )}

      {/* Danh sách địa chỉ để chọn */}
      <h5 className="mt-4">Chọn địa chỉ giao hàng</h5>
      <div className="d-flex flex-column gap-2 mb-3">
        {addresses.length > 0 ? (
          addresses.map(addr => (
            <Card
              key={addr.id_address}
              onClick={() => handleSelectAddress(addr)}
              style={{
                cursor: "pointer",
                border: selectedAddress?.id_address === addr.id_address ? "2px solid #007bff" : "1px solid #ccc",
                background: selectedAddress?.id_address === addr.id_address ? "#e9f5ff" : "#fff"
              }}
              className="p-3"
            >
              <strong>
                {addr.address_label}
                {addr.is_primary === true && (
                  <span
                    className="text-primary bg-light ms-2 px-2 py-1 rounded"
                    style={{ fontSize: "15px", fontWeight: 500 }}
                  >
                    Mặc định
                  </span>
                )}
              </strong>
              <div>{addr.name_city} - {addr.name_ward} - {addr.name_address}</div>
            </Card>
          ))
        ) : (
          <div>Chưa có địa chỉ nào</div>
        )}
      </div>

      {/* Form sửa/chỉnh sửa địa chỉ */}
      <h5 className="mt-4">Địa chỉ giao hàng</h5>
      <Form.Group className="mb-2">
        <Form.Label>Địa chỉ nhà</Form.Label>
        <Form.Control
          name="name_address"
          value={newAddress.name_address}
          onChange={handleChangeNewAddress}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Phường</Form.Label>
        <Form.Control
          name="name_ward"
          value={newAddress.name_ward}
          onChange={handleChangeNewAddress}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Thành phố</Form.Label>
        <Form.Control
          name="name_city"
          value={newAddress.name_city}
          onChange={handleChangeNewAddress}
        />
      </Form.Group>

      {/* Phương thức thanh toán */}
      <h5 className="mt-4">Phương thức thanh toán</h5>
      <Form.Check
        type="radio"
        label="Thanh toán khi nhận hàng (COD)"
        name="payment"
        value={1}
        checked={paymentMethod === 1}
        onChange={() => setPaymentMethod(1)}
      />
      <Form.Check
        type="radio"
        label="Thanh toán online"
        name="payment"
        value={2}
        checked={paymentMethod === 2}
        onChange={() => setPaymentMethod(2)}
      />
      <h5 className="mt-4">Ghi chú</h5>
      <Form.Group className="mb-2">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Nhập ghi chú nếu có"
          value={note || ""}
          onChange={(e) => setNote(e.target.value)}
        />
      </Form.Group>
    </div>
  );
}
