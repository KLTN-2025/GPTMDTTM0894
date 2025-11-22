const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

// Import các model
const Contact = require('./contact')(sequelize, DataTypes);

const Banner = require('./banner')(sequelize, DataTypes);

const Category = require('./categories')(sequelize, DataTypes);

const Customer = require('./customers')(sequelize, DataTypes);

const Product = require('./products')(sequelize, DataTypes);

const Employee = require('./employees')(sequelize, DataTypes);

const Address = require('./userAddress')(sequelize, DataTypes);

const ProductImg = require('./productImage')(sequelize, DataTypes);

const ProductSpec = require('./productSpec')(sequelize, DataTypes);

const Attribute = require('./Attribute')(sequelize, DataTypes);

const AttributeValue = require('./AttributeValue')(sequelize, DataTypes);

const ProductAttribute = require('./productAttribute')(sequelize, DataTypes);

const ProductVariant = require('./productVariant')(sequelize, DataTypes);

const VariantValue = require('./variantValue')(sequelize, DataTypes);

const ProductAttributeValue = require('./ProductAttributeValue') (sequelize, DataTypes);

const ProductReview = require('./comments') (sequelize, DataTypes);

const Voucher = require('./voucher') (sequelize, DataTypes);

const VoucherProduct = require('./voucherProduct') (sequelize, DataTypes);

const VoucherUsage = require('./voucherUsage') (sequelize, DataTypes);

const Cart = require('./cart') (sequelize, DataTypes);

const CartItem = require('./cartItems') (sequelize, DataTypes);

const CartItemAttributeValue = require('./cartItemAttributeValues') (sequelize, DataTypes);

const Order = require('./order') (sequelize, DataTypes);

const OrderDetail = require('./orderDetail') (sequelize, DataTypes);

const OrderItemAttributeValue = require('./orderItemAttributeValue') (sequelize, DataTypes);

const ShippingInfo = require('./shippingInfo') (sequelize, DataTypes);

const Payment = require('./payment') (sequelize, DataTypes);

// Khởi tạo object db
const db = {
  sequelize,
  Sequelize,

  // Models
  Contact,
  Banner,
  Category,
  Customer,
  Employee,
  Address,
  Product,
  ProductImg,
  ProductSpec,
  Attribute,
  AttributeValue,
  ProductAttribute,
  ProductVariant,
  VariantValue,
  ProductAttributeValue,
  ProductReview,
  Voucher,
  VoucherProduct,
  VoucherUsage,
  Cart,
  CartItem,
  CartItemAttributeValue,
  Order,
  OrderDetail,
  OrderItemAttributeValue,
  ShippingInfo,
  Payment,
};

/* =========================
   Thiết lập Associations
========================= */

// Danh mục cha - con
db.Category.belongsTo(db.Category, {
  foreignKey: 'parent_id',
  as: 'parent',
});
db.Category.hasMany(db.Category, {
  foreignKey: 'parent_id',
  as: 'children',
});

// Danh mục - Sản phẩm
db.Category.hasMany(db.Product, {
  foreignKey: 'category_id',
  as: 'products',
});
db.Product.belongsTo(db.Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Sản phẩm - Ảnh sản phẩm
db.Product.hasMany(db.ProductImg, {
  foreignKey: 'id_products',
  as: 'images',
});
db.ProductImg.belongsTo(db.Product, {
  foreignKey: 'id_products',
  as: 'product',
});

// Sản phẩm - Thông số kỹ thuật
db.Product.hasMany(db.ProductSpec, {
  foreignKey: 'id_products',
  as: 'specs',
});
db.ProductSpec.belongsTo(db.Product, {
  foreignKey: 'id_products',
  as: 'product',
});

// Khách hàng - Địa chỉ
db.Customer.hasMany(db.Address, {
  foreignKey: 'id_customer',
  as: 'addresses',
});
db.Address.belongsTo(db.Customer, {
  foreignKey: 'id_customer',
  as: 'customer',
});

db.Product.hasMany(db.ProductVariant, {
  foreignKey: 'id_products',
  as: 'variants',
});
db.ProductVariant.belongsTo(db.Product, {
  foreignKey: 'id_products',
  as: 'product',
});

db.Product.hasMany(db.ProductAttribute, {
  foreignKey: 'id_product',
  as: 'productAttributes',
});
db.ProductAttribute.belongsTo(db.Product, {
  foreignKey: 'id_product',
  as: 'product',
});

db.Attribute.hasMany(db.AttributeValue, {
  foreignKey: 'id_attribute',
  as: 'values',  // "values" đúng tên bạn dùng trong include
});
db.ProductAttribute.belongsTo(db.Attribute, {
  foreignKey: 'id_attribute',
  as: 'attribute',
});

db.ProductVariant.hasMany(db.VariantValue, {
  foreignKey: 'id_variant',
  as: 'variantValues',
});
db.VariantValue.belongsTo(db.ProductVariant, {
  foreignKey: 'id_variant',
  as: 'variant',
});

db.AttributeValue.belongsTo(db.Attribute, {
  foreignKey: 'id_attribute',
  as: 'attribute',
});
db.VariantValue.belongsTo(db.AttributeValue, {
  foreignKey: 'id_value',
  as: 'attributeValue',
});

// Ảnh sản phẩm - gắn với biến thể
db.ProductVariant.hasMany(db.ProductImg, {
  foreignKey: 'id_variant',
  as: 'images',
});
db.ProductImg.belongsTo(db.ProductVariant, {
  foreignKey: 'id_variant',
  as: 'variant',
});

// Ảnh sản phẩm - gắn với giá trị thuộc tính (option cụ thể)
db.AttributeValue.hasMany(db.ProductImg, {
  foreignKey: 'id_value',
  as: 'images',
});
db.ProductImg.belongsTo(db.AttributeValue, {
  foreignKey: 'id_value',
  as: 'value',
});

// ProductAttribute → AttributeValue

db.Attribute.hasMany(db.ProductAttribute, {
  foreignKey: 'id_attribute',
  as: 'productAttributes',
});

db.ProductAttributeValue.belongsTo(db.Product, { 
  foreignKey: 'id_product', 
  as: 'product' 
});

db.ProductAttributeValue.belongsTo(db.AttributeValue, { 
  foreignKey: 'id_value', 
  as: 'attributeValue' 
});

db.Product.hasMany(db.ProductAttributeValue, {
  foreignKey: 'id_product',
  as: 'productAttributeValues',
});

db.AttributeValue.hasMany(db.ProductAttributeValue, {
  foreignKey: 'id_value',
  as: 'productAttributeValues',
});

// comments
db.Product.hasMany(db.ProductReview, {
  foreignKey: "id_products",
  as: "reviews"
});
db.ProductReview.belongsTo(db.Product, {
  foreignKey: "id_products",
  as: 'product'
});

db.Customer.hasMany(db.ProductReview, {
  foreignKey: "id_customer",
  as: "reviews"
});

db.ProductReview.belongsTo(db.Customer, {
  foreignKey: "id_customer",
  as: "customer"
});

//voucher
db.Voucher.belongsToMany(db.Product, {
  through: db.VoucherProduct,
  foreignKey: 'id_voucher',
  otherKey: 'id_product',
  as: 'products'
});

db.Product.belongsToMany(db.Voucher, {
  through: db.VoucherProduct,
  foreignKey: 'id_product',
  otherKey: 'id_voucher',
  as: 'vouchers'
});

db.Voucher.belongsToMany(db.Customer, {
  through: db.VoucherUsage,
  foreignKey: 'id_voucher',
  otherKey: 'id_customer',
  as: 'users'
});

db.Customer.belongsToMany(db.Voucher, {
  through: db.VoucherUsage,
  foreignKey: 'id_customer',
  otherKey: 'id_voucher',
  as: 'vouchers'
});

//cart
// Cart 1-n CartItem
db.Cart.hasMany(db.CartItem, {
  foreignKey: 'id_cart',
  as: 'items'
});
db.CartItem.belongsTo(db.Cart, {
  foreignKey: 'id_cart',
  as: 'cart'
});

// Cart thuộc về Customer
db.Cart.belongsTo(db.Customer, {
  foreignKey: 'id_customer',
  as: 'customer'
});
db.Customer.hasMany(db.Cart, {
  foreignKey: 'id_customer',
  as: 'carts'
});

// ======================= CART ITEM =======================
// CartItem 1-n CartItemAttributeValue
db.CartItem.hasMany(db.CartItemAttributeValue, {
  foreignKey: 'id_cart_items',
  as: 'attribute_values'
});
db.CartItemAttributeValue.belongsTo(db.CartItem, {
  foreignKey: 'id_cart_items',
  as: 'cart_item'
});

// CartItem thuộc về Product
db.CartItem.belongsTo(db.Product, {
  foreignKey: 'id_product',
  as: 'product'
});
db.Product.hasMany(db.CartItem, {
  foreignKey: 'id_product',
  as: 'cart_items'
});

// ======================= ATTRIBUTE VALUE =======================
// CartItemAttributeValue thuộc về AttributeValue
db.CartItemAttributeValue.belongsTo(db.AttributeValue, {
  foreignKey: 'id_value',
  as: 'attribute_value'
});
db.AttributeValue.hasMany(db.CartItemAttributeValue, {
  foreignKey: 'id_value',
  as: 'cart_item_values'
});

db.CartItem.belongsTo(db.ProductVariant, {
  foreignKey: 'id_variant',  // giả sử trường này có trong cart_items
  as: 'variant'
});

db.ProductVariant.hasMany(db.CartItem, {
  foreignKey: 'id_variant',
  as: 'cart_items'
});

// ========== ASSOCIATION ĐƠN HÀNG ==========
db.Customer.hasMany(db.Order, {
  foreignKey: 'id_customer',
  as: 'orders',
});
db.Order.belongsTo(db.Customer, {
  foreignKey: 'id_customer',
  as: 'customer',
});

// ========== ASSOCIATION CHI TIẾT ĐƠN HÀNG ==========
db.Order.hasMany(db.OrderDetail, {
  foreignKey: 'id_order',
  as: 'order_details',
});
db.OrderDetail.belongsTo(db.Order, {
  foreignKey: 'id_order',
  as: 'order',
});

db.Product.hasMany(db.OrderDetail, {
  foreignKey: 'id_product',
  as: 'order_details',
});
db.OrderDetail.belongsTo(db.Product, {
  foreignKey: 'id_product',
  as: 'product',
});

// db.OrderDetail.belongsTo(ProductVariant, {
//   foreignKey: 'id_variant',
//   as: 'variant',
// });

// db.ProductVariant.hasMany(OrderDetail, {
//   foreignKey: 'id_variant',
//   as: 'order_details',
// })

// ========== ASSOCIATION ATTRIBUTE TRONG ORDER ==========
db.OrderDetail.hasMany(db.OrderItemAttributeValue, {
  foreignKey: 'id_order_detail',
  as: 'attribute_values',
});
db.OrderItemAttributeValue.belongsTo(db.OrderDetail, {
  foreignKey: 'id_order_detail',
  as: 'order_detail',
});

db.AttributeValue.hasMany(db.OrderItemAttributeValue, {
  foreignKey: 'id_value',
  as: 'order_attributes',
});
db.OrderItemAttributeValue.belongsTo(db.AttributeValue, {
  foreignKey: 'id_value',
  as: 'attribute_value',
});

// ========== ASSOCIATION SHIPPING ==========
db.Order.hasOne(db.ShippingInfo, {
  foreignKey: 'id_order',
  as: 'shipping_info',
});
db.ShippingInfo.belongsTo(db.Order, {
  foreignKey: 'id_order',
  as: 'order',
});

// ========== ASSOCIATION PAYMENT ==========
db.Order.hasOne(db.Payment, {
  foreignKey: 'id_order',
  as: 'payment',
});
db.Payment.belongsTo(db.Order, {
  foreignKey: 'id_order',
  as: 'order',
});

module.exports = db;