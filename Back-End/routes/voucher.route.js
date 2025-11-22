const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const verifyToken = require('../middlewares/verifyToken');

//apply voucher
router.post('/apply', verifyToken, voucherController.applyVoucher);

//create voucher
router.post('/', voucherController.createVoucher);

//list all voucher
router.get('/', voucherController.getAllVouchers);

//get detail voucher
router.get('/:id', voucherController.getVoucherById);

//update voucher by id
router.put('/:id', voucherController.updateVoucher);

module.exports = router;