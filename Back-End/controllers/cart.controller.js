const db = require('../models/index.model');

const {

    sequelize,

    Cart,

    CartItem,

    CartItemAttributeValue,

    ProductVariant,

    VariantValue,

    } = db;

//add product to cart
exports.addToCart = async (req, res) => {
  const { id_customer, id_product, quantity, attribute_value_ids } = req.body;

  if (!id_customer || !id_product || !quantity || !Array.isArray(attribute_value_ids)) {
    return res.status(400).json({ message: 'Thiếu thông tin yêu cầu.' });
  }

  // Helper so sánh 2 mảng số
  const arraysEqual = (a, b) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  const t = await sequelize.transaction();

  try {
    // 1. Lấy hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ where: { id_customer } });
    if (!cart) {
      cart = await Cart.create({ id_customer }, { transaction: t });
    }

    // 2. Tìm variant phù hợp nếu có option
    let matchedVariant = null;
    const sortedIncomingAttrs = [...attribute_value_ids].sort();

    if (attribute_value_ids.length > 0) {
      const productVariants = await ProductVariant.findAll({
        where: { id_products: id_product },
        include: [
          {
            model: VariantValue,
            as: 'variantValues',
            attributes: ['id_value']
          }
        ],
        transaction: t
      });

      for (const variant of productVariants) {
        const variantAttrIds = variant.variantValues.map(v => v.id_value).sort();
        if (arraysEqual(variantAttrIds, sortedIncomingAttrs)) {
          matchedVariant = variant;
          break;
        }
      }

      // ✅ Nếu có option nhưng không tìm thấy SKU tương ứng thì báo lỗi
      if (!matchedVariant) {
        await t.rollback();
        return res.status(400).json({
          message: 'Tổ hợp option bạn chọn không hợp lệ hoặc chưa tồn tại SKU tương ứng.'
        });
      }
    }

    const id_variant = matchedVariant ? matchedVariant.id_variant : null;

    // 3. Lấy cart items cùng product, variant
    const cartItems = await CartItem.findAll({
      where: {
        id_cart: cart.id_cart,
        id_product,
        id_variant
      },
      include: [
        {
          model: CartItemAttributeValue,
          as: 'attribute_values'
        }
      ],
      transaction: t
    });

    // 4. Tìm item có đúng attribute_value_ids
    let matchedItem = null;
    for (const item of cartItems) {
      const currentAttrIds = item.attribute_values.map(av => av.id_value).sort();
      if (arraysEqual(currentAttrIds, sortedIncomingAttrs)) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      // 5. Nếu có rồi thì tăng quantity
      matchedItem.quantity += quantity;
      await matchedItem.save({ transaction: t });
    } else {
      // 6. Nếu chưa có thì tạo mới CartItem và CartItemAttributeValue
      const newItem = await CartItem.create(
        {
          id_cart: cart.id_cart,
          id_product,
          id_variant,
          quantity
        },
        { transaction: t }
      );

      const attributeValues = attribute_value_ids.map(id_value => ({
        id_cart_items: newItem.id_cart_items,
        id_value
      }));

      await CartItemAttributeValue.bulkCreate(attributeValues, { transaction: t });
    }

    await t.commit();
    return res.status(200).json({ message: 'Thêm vào giỏ hàng thành công.' });
  } catch (error) {
    await t.rollback();
    console.error('Thêm vào giỏ hàng thất bại:', error);
    return res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng.' });
  }
};

//get cart by id
exports.getCartByCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await db.Cart.findOne({
      where: { id_customer: id },
      include: [
        {
          model: db.CartItem,
          as: 'items',
          include: [
            {
              model: db.Product,
              as: 'product',
              attributes: ['id_products', 'products_name', 'products_slug'],
              // include: [
              //   {
              //     model: db.ProductImg,
              //     as: 'images',
              //     where: { is_main: true, id_value: null, id_variant: null },
              //     required: false,
              //     attributes: ['id_product_img', 'id_products', 'img_url', 'is_main']
              //   }
              // ]
            },
            {
              model: db.ProductVariant,
              as: 'variant',
              attributes: ['id_variant', 'sku', 'price', 'quantity', 'status']
            },
            {
              model: db.CartItemAttributeValue,
              as: 'attribute_values',
              include: [
                {
                  model: db.AttributeValue,
                  as: 'attribute_value',
                  attributes: ['id_value', 'value', 'id_attribute', 'value_note'],
                  include: [
                    {
                      model: db.Attribute,
                      as: 'attribute',
                      attributes: ['id_attribute', 'name', 'type']
                    },
                    {
                      model: db.ProductImg,
                      as: 'images',
                      where: { is_main: true },
                      required: false,
                      attributes: ['id_product_img', 'id_products', 'img_url', 'is_main']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    // Nếu chưa có cart thì trả về rỗng
    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    const plainCart = cart.get({ plain: true });

    const filteredItems = plainCart.items.map(item => {
      const productId = item.product?.id_products;

      const filteredAttributes = item.attribute_values.map(attr => {
        const images = (attr.attribute_value?.images || []).filter(
          img => img.id_products === productId
        );

        return {
          ...attr,
          attribute_value: {
            ...attr.attribute_value,
            images
          }
        };
      });

      const price = item.variant?.price || item.product?.products_sale_price;

      return {
        ...item,

        product:{
          ...item.product,
          products_slug: item.product?.products_slug || ""
        },

        attribute_values: filteredAttributes,
        price
      };
    });

    return res.status(200).json({ items: filteredItems });
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng.' });
  }
};

//update cart by id customer
exports.updateCartItem = async (req, res) => {
  const { id } = req.params; // id_customer
  const { id_cart_items, id_product, attribute_value_ids, quantity } = req.body;

  if (!id_cart_items || !id_product || !Array.isArray(attribute_value_ids) || !quantity) {
    return res.status(400).json({ message: 'Thiếu thông tin cập nhật.' });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Tìm giỏ hàng của khách
    const cart = await Cart.findOne({
      where: { id_customer: id },
      transaction: t
    });
    if (!cart) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    }

    // 2. Tìm item cần cập nhật
    const cartItem = await CartItem.findOne({
      where: {
        id_cart_items,
        id_cart: cart.id_cart,
        id_product
      },
      include: [
        { model: CartItemAttributeValue, as: 'attribute_values' }
      ],
      transaction: t
    });
    if (!cartItem) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ.' });
    }

    // 3. Tìm lại variant mới theo combo attribute_value_ids
    const productVariants = await ProductVariant.findAll({
      where: { id_products: id_product },
      include: [{
        model: VariantValue,
        as: 'variantValues',
        attributes: ['id_value']
      }],
      transaction: t
    });

    let matchedVariant = null;
    const incomingAttrIds = [...attribute_value_ids].sort();

    for (const variant of productVariants) {
      const variantAttrIds = variant.variantValues.map(v => v.id_value).sort();
      if (JSON.stringify(variantAttrIds) === JSON.stringify(incomingAttrIds)) {
        matchedVariant = variant;
        break;
      }
    }

    const new_variant_id = matchedVariant ? matchedVariant.id_variant : null;

    // 4. Cập nhật cart item
    cartItem.id_variant = new_variant_id;
    cartItem.quantity = quantity;
    await cartItem.save({ transaction: t });

    // 5. Xoá attribute cũ và thêm mới
    await CartItemAttributeValue.destroy({
      where: { id_cart_items },
      transaction: t
    });

    const newValues = attribute_value_ids.map(id_value => ({
      id_cart_items,
      id_value
    }));

    await CartItemAttributeValue.bulkCreate(newValues, { transaction: t });

    await t.commit();
    return res.status(200).json({ message: 'Cập nhật giỏ hàng thành công.' });
  } catch (err) {
    await t.rollback();
    console.error('Lỗi khi cập nhật giỏ hàng:', err);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật giỏ hàng.' });
  }
};

//delete product cart
exports.deleteCartItem = async (req, res) => {
  const { id } = req.params; // id_customer
  const { id_cart_items } = req.body;

  if (!id_cart_items) {
    return res.status(400).json({ message: 'Thiếu id_cart_items để xóa.' });
  }

  const t = await sequelize.transaction();

  try {
    // 1. Tìm giỏ hàng của khách
    const cart = await Cart.findOne({
      where: { id_customer: id },
      transaction: t
    });
    if (!cart) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    }

    // 2. Tìm item giỏ hàng theo id_cart_items và id_cart
    const cartItem = await CartItem.findOne({
      where: {
        id_cart_items,
        id_cart: cart.id_cart
      },
      transaction: t
    });
    if (!cartItem) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ.' });
    }

    // 3. Xóa attribute liên quan trước
    await CartItemAttributeValue.destroy({
      where: { id_cart_items },
      transaction: t
    });

    // 4. Xóa cart item
    await cartItem.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công.' });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi khi xóa sản phẩm giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm giỏ hàng.' });
  }
};