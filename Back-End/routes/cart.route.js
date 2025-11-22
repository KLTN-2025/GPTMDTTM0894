const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

//add
router.post('/add', cartController.addToCart);

//get cart by id
router.get('/customer/:id', cartController.getCartByCustomer);

//update cart product by id
router.put('/update/:id', cartController.updateCartItem);

//delete cart product by id
router.delete('/delete/:id', cartController.deleteCartItem);

module.exports = router;