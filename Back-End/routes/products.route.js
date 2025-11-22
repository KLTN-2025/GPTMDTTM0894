const express = require('express');
const router = express.Router();
const upload = require('../helper/upload'); // dùng multer
const productController = require('../controllers/product.controller');
const validateJsonMiddleware = require('../middlewares/validateJson');

// ✅ SỬ DỤNG LẠI HÀM GIẢ ĐỊNH (STUB) ĐỂ KHẮC PHỤC LỖI TypeError
const getTopProductsStub = (req, res) => {
    // Trả về dữ liệu mẫu và status 200 OK để Server chạy và Frontend không lỗi 404
    return res.status(200).json({
        message: "Route Top Products OK!",
        products: [] 
    });
};

//get id products for admin
router.get('/admin/:id', productController.getProductsByIdforAdmin);

//search product
router.get('/search', productController.searchProducts);

// ✅ ROUTE NÀY SẼ DÙNG HÀM GIẢ ĐỊNH ĐỂ TEST TẠM
router.get('/top-products', getTopProductsStub);

//add product
router.post(
    '/',
    upload.fields([
        { name: 'commonImages', maxCount: 30 },
        { name: 'optionImages', maxCount: 30 }
    ]),
    validateJsonMiddleware(['specs', 'attributes', 'variants']),
    productController.createProducts
);

//update product
router.put(
    '/:id',
    upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'optionFiles', maxCount: 30}
    ]),
    productController.updateProduct
);

//get product by id
router.get('/:slug', productController.getProductsById);

//get all products
router.get('/', productController.getAllProducts);

//primany products
router.patch('/:id/toggle-primary', productController.togglePrimary);

//delete product for tester
router.delete('/:id', productController.deleteProductHard);

//get product by id
router.get('/same-products/:id/same', productController.getSameProducts);

module.exports = router;