const express = require('express');
const router = express.Router();
const addressControllers = require("../controllers/userAddress.controller");

//thêm địa chỉ
router.post('/', addressControllers.createAddress);

//xóa địa chỉ
router.delete('/:id', addressControllers.deleteAddress);

//cập nhật địa chỉ
router.put('/:id', addressControllers.updateAddress);

//lấy danh sách địa chỉ dựa theo id
router.get('/customer/:id', addressControllers.getAddressesByCustomerId);

//xem địa chỉ riêng theo id địa chỉ
router.get('/:id', addressControllers.getAddressById);

module.exports = router;