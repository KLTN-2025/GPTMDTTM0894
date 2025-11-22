const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// Tạo liên hệ
router.post("/", contactController.createContact);

// Lấy tất cả liên hệ
router.get("/", contactController.getAllContacts);

// Lấy theo ID
router.get("/:id", contactController.getContactById);

//update
router.put("/:id", contactController.updateContact);

module.exports = router;