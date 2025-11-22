const { 
          Category, 
          Product, 
          ProductImg,
          ProductAttribute,
          ProductAttributeValue,
          Attribute,
          AttributeValue,
          ProductVariant,
          VariantValue,
        } = require('../models/index.model');

const { Op, where } = require("sequelize");

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null }, // Bỏ is_active tạm thời
      attributes: ['category_id', 'name','note', 'img', 'is_active', 'is_primary', 'parent_id'],
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['category_id', 'name', 'img', 'is_active', 'is_primary', 'parent_id'],
          required: false, // Bao gồm cả danh mục cha không có con
          include: [
            {
              model: Category,
              as: 'children',
              attributes: ['category_id', 'name', 'img', 'is_active', 'is_primary', 'parent_id'],
              required: false,
            },
          ],
        },
      ],
      order: [['category_id', 'ASC'], [{ model: Category, as: 'children' }, 'category_id', 'ASC']],
    });

    res.json(categories);
  } catch (err) {
    console.error('Lỗi khi lấy danh mục:', err);
    res.status(500).json({ error: err.message });
  }
};


// Lấy danh mục theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh mục con theo parent_id
exports.getChildrenByParentId = async (req, res) => {
  try {
    const parentId = parseInt(req.params.parentId); // ✅ ép kiểu về số
    const children = await Category.findAll({
      where: { parent_id: parentId },
    });

    console.log("✅ Children of parent_id =", parentId, ":", children.length);

    res.json(children);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh mục con:", err);
    res.status(500).json({ error: err.message });
  }
};


// Thêm danh mục
exports.createCategory = async (req, res) => {
  try {
    const { name, note, parent_id, is_active, is_primary } = req.body;

    // Validate file ảnh
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
    if (req.file.size < 2 * 1024 * 1024) { // < 2MB
      return res.status(400).json({ message: 'Dung lượng ảnh tối thiểu 2MB' });
    }

    const banner = req.file.filename;

    const exists = await Category.findOne({ where: { name, parent_id: parent_id ?? null } });
    if (exists) return res.status(400).json({ message: 'Danh mục đã tồn tại' });

    const newCat = await Category.create({
      name,
      note,
      parent_id: parent_id || null,
      is_active: is_active === 'true' || is_active === true,
      is_primary: is_primary === 'true' || is_primary === true,
      img: banner
    });

    res.status(201).json(newCat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


//ẩn hiện danh mục
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy category theo id
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

    // Đảo trạng thái is_active
    category.is_active = !category.is_active;
    await category.save();

    res.json({ message: 'Cập nhật trạng thái ẩn/hiện thành công', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


//ghim danh mục lên trang chủ
exports.togglePrimary = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    // Đổi trạng thái is_primary (ghim hoặc bỏ ghim)
    category.is_primary = !category.is_primary;
    await category.save();

    return res.status(200).json({ 
      message: category.is_primary ? 'Đã ghim danh mục' : 'Đã bỏ ghim danh mục',
      category 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, note, parent_id, is_active, is_primary } = req.body;

  try {
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

    // Validate ảnh mới nếu có
    if (req.file) {
      if (req.file.size < 2 * 1024 * 1024) {
        return res.status(400).json({ message: 'Dung lượng ảnh tối thiểu 2MB' });
      }
      category.img = req.file.filename;
    }

    category.name = name || category.name;
    category.parent_id = parent_id || null;
    category.is_active = is_active !== undefined ? is_active : category.is_active;

    // Nếu là danh mục con → xóa banner + note + không ghim
    if (category.parent_id) {
      category.is_primary = 0;
      category.note = '';
      category.img = req.file ? category.img : null; // chỉ giữ nếu upload mới
    } else {
      category.is_primary = is_primary !== undefined ? is_primary : category.is_primary;
      category.note = note || category.note;
    }

    await category.save();
    res.json({ message: 'Cập nhật thành công', category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { category_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//for guest
exports.getParentCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: 0, parent_id: null },
      order: [['name','ASC']],
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// controllers/category.controller.js
exports.getCategoryDetail = async (req, res) => {
  const { name } = req.params;

  try {
    // 1. Lấy danh mục cha
    const parentCategory = await Category.findOne({
      where: { name, parent_id: null },
      attributes: ['category_id', 'name', 'note', 'img'],
    });

    if (!parentCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const parentId = parentCategory.category_id;

    // 2. Lấy danh mục con
    const children = await Category.findAll({
      where: { parent_id: parentId },
      attributes: ['category_id', 'name', 'img'],
    });

    const childIds = children.map(child => child.category_id);
    const allCategoryIds = [parentId, ...childIds];

    // 3. Lấy sản phẩm
    const products = await Product.findAll({
      where: {
        category_id: allCategoryIds,
        products_status: 2,
      },
      attributes: [
        'id_products',
        'products_name',
        'products_slug',
        'products_market_price',
        'products_sale_price',
        'category_id',
      ],
      include: [
        {
          model: ProductImg,
          as: 'images',
          required: false,
          attributes: ['Img_url', 'is_main'],
          where: { is_main: true, id_value: null, id_variant: null },
        },
      ],
    });

    // 4. Với mỗi sản phẩm, lấy attributes và skus, rồi tính giá
    const productsWithPrices = await Promise.all(products.map(async (product) => {
      const id = product.id_products;

      // Lấy attributes + giá trị
      const productAttributes = await ProductAttribute.findAll({
        where: { id_product: id },
        include: [
          {
            model: Attribute,
            as: 'attribute',
            attributes: ['id_attribute', 'name', 'type'],
            include: [
              {
                model: AttributeValue,
                as: 'values',
                required: false,
                include: [
                  {
                    model: ProductAttributeValue,
                    as: 'productAttributeValues',
                    where: { id_product: id },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      const attributes = productAttributes
        .filter(pa => pa.attribute && Array.isArray(pa.attribute.values))
        .map(pa => {
          const filteredValues = pa.attribute.values.filter(
            v => v.productAttributeValues && v.productAttributeValues.length > 0
          );

          return {
            id_attribute: pa.attribute.id_attribute,
            name: pa.attribute.name,
            type: pa.attribute.type,
            values: filteredValues.map(v => ({
              id_value: v.id_value,
              value: v.value,
              value_note: v.value_note,
              extra_price: v.extra_price,
              quantity: v.quantity,
              status: v.status,
            })),
          };
        });

      // Lấy skus + option combo
      const variantsRaw = await ProductVariant.findAll({
        where: { id_products: id },
        include: [
          {
            model: VariantValue,
            as: 'variantValues',
            include: [
              {
                model: AttributeValue,
                as: 'attributeValue',
                include: [
                  {
                    model: Attribute,
                    as: 'attribute',
                  },
                ],
              },
            ],
          },
        ],
      });

      const skus = variantsRaw.map(variant => ({
        variant_id: variant.id_variant,
        quantity: variant.quantity,
        price: variant.price,
        price_sale: variant.price_sale,
        status: variant.status,
        option_combo: variant.variantValues.map(v => ({
          attribute: v.attributeValue?.attribute?.name,
          value: v.attributeValue?.value,
          type: v.attributeValue.attribute?.type,
          id_value: v.attributeValue?.id_value,
        })),
      }));

      // Xác định loại sản phẩm
      let productType = 1;
      if (skus.length > 0) {
        productType = 3;
      } else if (attributes.length > 0) {
        productType = 2;
      }

      // Tính giá
      let originalPrice = parseFloat(product.products_market_price) || 0;
      let salePrice = parseFloat(product.products_sale_price) || 0;

      if (productType === 2) {
        const extraPrices = attributes.flatMap(attr =>
          attr.values.map(v => parseFloat(v.extra_price || 0))
        ).filter(n => !isNaN(n));
        if (extraPrices.length > 0) {
          salePrice += Math.min(...extraPrices);
        }
      } else if (productType === 3) {
        const variantPrices = skus.map(sku => parseFloat(sku.price)).filter(n => !isNaN(n));
        const variantSalePrices = skus.map(sku => parseFloat(sku.price_sale)).filter(n => !isNaN(n));
        if (variantPrices.length > 0) {
          originalPrice = Math.min(...variantPrices);
        }
        if (variantSalePrices.length > 0) {
          salePrice = Math.min(...variantSalePrices);
        }
      }

      // Trả về sản phẩm kèm giá đã tính
      return {
        ...product.toJSON(),
        attributes,
        skus,
        productType,
        market_price: originalPrice,
        sale_price: salePrice,
      };
    }));

    // 5. Trả về dữ liệu
    res.json({
      category_id: parentId,
      name: parentCategory.name,
      img: parentCategory.img,
      note: parentCategory.note,
      children,
      products: productsWithPrices,
    });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết danh mục:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHomepageData = async (req, res) => {
  try {

    const categories = await Category.findAll({
      where: { is_primary: true },
      include: [
        {
          model: Product,
          as: 'products',
          required: false,
          attributes: ['id_products', 'category_id', 'products_name', 'products_primary', 'products_status'],
          where: {
            products_primary: 1, // bạn có thể bật lên nếu muốn lọc theo
            products_status: { [Op.in]: [2, 4] }
          },
          include: [
            {
              model: ProductImg,
              as: 'images',
              required: false,
              where: {
                is_main: true,
                id_variant: null,
                id_value: null,
              },
              attributes: ['id_product_img', 'Img_url']
            }
          ],
        }
      ],
      
    });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục hoặc sản phẩm" });
    }

    res.json(categories);
  } catch (err) {
    console.error("Lỗi lấy homepage data:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
