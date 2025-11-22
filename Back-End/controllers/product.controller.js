const db = require('../models/index.model');
const path = require('path');
const { Op } = require("sequelize");
const fs = require('fs');
const { sequelize } = db;
const { parseJSONSafe } = require('../helper/parseJson');
const generateSKU = require('../helper/generateSKU');
const getAllChildCategoryIds = require('../utils/getCategories');
const { generateUniqueSlug } = require('../helper/generateSlug');

const {
  Product, 
  ProductImg, 
  ProductSpec, 
  ProductAttribute,
  ProductVariant, 
  VariantValue, 
  AttributeValue, 
  Attribute,
  ProductAttributeValue, 
  Category, 
} = db;

//search
exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q?.trim();

    if (!keyword) {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const rows = await Product.findAll({
      where: {
        products_name: {
          [Op.like]: `%${keyword}%`
        },
        products_status: 2
      },
      include: [
        {
          model: ProductImg,
          as: "images",
          where: { is_main: true, id_value: null, id_variant: null },
          required: false,
          attributes: ["Img_url"]
        },
        {
          model: ProductVariant,
          as: "variants",
          required: false,
          attributes: ["price", "price_sale"]
        },
        {
          model: ProductAttributeValue,
          as: "productAttributeValues",
          required: false,
          include: [
            {
              model: AttributeValue,
              as: "attributeValue",
              attributes: ["extra_price"]
            }
          ]
        }
      ],
      order: [["products_name", "ASC"]],
      limit: 8
    });

    if (rows.length === 0) {
      return res.json({
        message: "Không tìm thấy sản phẩm nào",
        products: []
      });
    }

    const products = rows.map(p => {
      let productType = 1;
      let marketPrice = parseFloat(p.products_market_price) || 0;
      let salePrice = parseFloat(p.products_sale_price) || 0;

      if (p.variants?.length > 0) {
        productType = 3;
        const variantPrices = p.variants.map(v => parseFloat(v.price)).filter(v => !isNaN(v));
        const variantSalePrices = p.variants.map(v => parseFloat(v.price_sale)).filter(v => !isNaN(v));
        if (variantPrices.length > 0) marketPrice = Math.min(...variantPrices);
        if (variantSalePrices.length > 0) salePrice = Math.min(...variantSalePrices);
      } 
      else if (p.productAttributeValues?.length > 0) {
        productType = 2;
        const extraPrices = p.productAttributeValues
          .map(item => parseFloat(item?.attributeValue?.extra_price))
          .filter(val => !isNaN(val));
        if (extraPrices.length > 0) salePrice = Math.min(...extraPrices);
      }

      return {
        products_id: p.id_products,
        products_slug: p.products_slug,
        products_name: p.products_name,
        main_image_url: p.images?.[0]?.Img_url || null,
        market_price: marketPrice,
        sale_price: salePrice,
      };
    });

    res.json(products);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm gợi ý:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//lấy danh sách danh mục và sản phẩm được ghim

//lấy sản phẩm tưng tự
exports.getSameProducts = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findOne({
      where: { id_products: id },
      include: [
        {
          model: ProductImg,
          as: "images",
          attributes: ["img_url", "is_main"],
        },
        {
          model: ProductSpec,
          as: "specs",
        },
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "parent_id"],
          include: [
            {
              model: Category,
              as: "parent",
              attributes: ["category_id", "name"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ product });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

//create product
exports.createProducts = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      products_name,
      category_id,
      products_slug,
      products_market_price,
      products_sale_price,
      products_description,
      product_shorts,
      products_quantity,
      specs,
      attributes,
      variants,
      commonImageIsMain,
      optionImageIsMain,
      optionImageValues,
    } = req.body;

    // Validate input
    if (!products_name?.trim()) return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    if (!category_id || isNaN(+category_id)) return res.status(400).json({ message: "Danh mục không hợp lệ" });

    const marketPrice = parseFloat(products_market_price) || 0;
    const salePrice = parseFloat(products_sale_price) || 0;
    if (marketPrice < 0 || salePrice < 0) return res.status(400).json({ message: "Giá không được âm" });

    const specsParsed = parseJSONSafe(specs, []);
    const attributesParsed = parseJSONSafe(attributes, []);
    const variantsParsed = parseJSONSafe(variants, []);

    const slug = await generateUniqueSlug(Product, products_name);

    const newProduct = await Product.create({
      products_name: products_name.trim(),
      products_slug: slug,
      category_id: +category_id,
      products_market_price: marketPrice,
      products_sale_price: salePrice,
      products_description: products_description || '',
      product_shorts: product_shorts,
      products_quantity: products_quantity,
      products_status: 1,
      products_primary: 0,
    }, { transaction: t });

    // ===== Attributes & Values =====
    const attributeValueMap = {};

    for (const attr of attributesParsed) {
      if (!attr.name || !Array.isArray(attr.values)) continue;

      const name = attr.name.trim();
      const type = Number(attr.type ?? 0); // Mặc định type = 0 nếu không có

      const attribute = await Attribute.create({ name, type }, { transaction: t });

      // Nếu attribute đã tồn tại nhưng type chưa đúng → cập nhật lại type
      if (attribute.type === null || attribute.type !== type) {
        await attribute.update({ type }, { transaction: t });
      }

      await ProductAttribute.create({
        id_product: newProduct.id_products,
        id_attribute: attribute.id_attribute,
      }, { transaction: t });

      attributeValueMap[name] = {};

      for (const val of attr.values) {
        const label = typeof val === 'string' ? val : val?.label;
        const value_note = typeof val === 'object' ? val?.value_note?.trim() || null : null;
        const extra_price = typeof val === 'object' && val.extra_price ? val.extra_price : 0;
        if (!label?.trim()) continue;

        const attributeValue = await AttributeValue.create({
          id_attribute: attribute.id_attribute,
          value: label.trim(),
          extra_price,
          value_note,
        }, { transaction: t });

        // Nếu đã tồn tại nhưng value_note khác thì cập nhật
        if (attributeValue.value_note !== value_note) {
          await attributeValue.update({ value_note }, { transaction: t });
        }

        await ProductAttributeValue.findOrCreate({
          where: {
            id_product: newProduct.id_products,
            id_value: attributeValue.id_value,
          },
          defaults: {
            id_product: newProduct.id_products,
            id_value: attributeValue.id_value,
          },
          transaction: t,
        });

        attributeValueMap[name][label.trim()] = attributeValue.id_value;
      }
    }

    // ===== Images =====
    const getIdValueFromLabel = (label) => {
      for (const attr in attributeValueMap) {
        if (attributeValueMap[attr][label]) {
          return attributeValueMap[attr][label];
        }
      }
      return null;
    };

    const groupedImages = { common: [], byValue: {} };
    const commonImages = req.files?.commonImages || [];
    const optionImages = req.files?.optionImages || [];

    const commonFlags = Array.isArray(commonImageIsMain) ? commonImageIsMain : [commonImageIsMain];
    const optionFlags = Array.isArray(optionImageIsMain) ? optionImageIsMain : [optionImageIsMain];
    const optionLabels = Array.isArray(optionImageValues) ? optionImageValues : [optionImageValues];

    commonImages.forEach((file, i) => {
      groupedImages.common.push({
        id_products: newProduct.id_products,
        id_variant: null,
        id_value: null,
        Img_url: `/uploads/${file.filename}`,
        is_main: commonFlags[i] === 'true',
      });
    });

    optionImages.forEach((file, i) => {
      const label = optionLabels[i];
      const id_value = getIdValueFromLabel(label);
      if (!id_value) return;
      if (!groupedImages.byValue[id_value]) groupedImages.byValue[id_value] = [];
      groupedImages.byValue[id_value].push({
        id_products: newProduct.id_products,
        id_variant: null,
        id_value,
        Img_url: `/uploads/${file.filename}`,
        is_main: optionFlags[i] === 'true',
      });
    });

    const processMain = (images) => {
      let flagged = false;
      return images.map(img => {
        if (!flagged && img.is_main) {
          flagged = true;
          return img;
        }
        return { ...img, is_main: false };
      });
    };

    const finalImages = [
      ...processMain(groupedImages.common),
      ...Object.values(groupedImages.byValue).flatMap(processMain),
    ];

    await ProductImg.bulkCreate(finalImages, { transaction: t });

    // ===== Specs =====
    for (const spec of specsParsed) {
      if (spec.name?.trim() && spec.value?.trim()) {
        await ProductSpec.create({
          id_products: newProduct.id_products,
          spec_name: spec.name.trim(),
          spec_value: spec.value.trim(),
        }, { transaction: t });
      }
    }

    // ===== Variants =====
    await saveVariants(variantsParsed, newProduct, [...commonImages, ...optionImages], attributeValueMap, t);

    await t.commit();
    res.status(201).json({ message: 'Tạo sản phẩm thành công', product: newProduct });
  } catch (err) {
    await t.rollback();
    console.error('❌ Lỗi tạo sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: err.message });
  }
};

// Hàm xử lý biến thể, thêm log chi tiết
async function saveVariants(variantsParsed, newProduct, uploadedImages, attributeValueMap, transaction) {
  console.log("🔔 saveVariants bắt đầu với", variantsParsed.length, "variants");
  const mainAttrName = Object.keys(attributeValueMap)[0];
  console.log("▶️ Thuộc tính chính (mainAttrName):", mainAttrName);

  for (const v of variantsParsed) {
    const values = {};
    if (Array.isArray(v.combo)) {
      for (const item of v.combo) {
        if (item.optionName && item.value) {
          values[item.optionName.trim()] = item.value.trim();
        }
      }
    }

    if (!v.price || typeof values !== "object" || Object.keys(values).length === 0) {
      console.warn("⚠️ Variant thiếu price hoặc values:", v);
      continue;
    }

    console.log("⏳ Xử lý variant:", v);

    const quantity = parseInt(v.quantity) || 0;
    const status = quantity > 0 ? 2 : 1;

    const variantImgIndex = parseInt(v.main_image_index);
    const isValidVariantImgIndex =
      !isNaN(variantImgIndex) &&
      variantImgIndex >= 0 &&
      variantImgIndex < uploadedImages.length;

    const autoSKU = generateSKU(newProduct.products_name, values);
    const finalSKU = v.sku?.trim() || autoSKU;

    const variant = await ProductVariant.create({
      id_products: newProduct.id_products,
      sku: finalSKU,
      price: parseFloat(v.price),
      price_sale: parseFloat(v.price_sale || 0), // ✅ FIX lỗi chính tả
      quantity,
      status,
    }, { transaction });

    // ✅ Tìm id_value chính xác hơn
    for (const [attrName, attrValue] of Object.entries(values)) {
      let id_value = null;
      const mapByAttr = attributeValueMap[attrName?.trim()];
      if (mapByAttr) {
        for (const [key, valId] of Object.entries(mapByAttr)) {
          if (key.trim() === attrValue.trim()) {
            id_value = valId;
            break;
          }
        }
      }

      if (!id_value) {
        console.warn(`❌ Không tìm thấy id_value cho ${attrName} = ${attrValue}`);
        throw new Error(`Thiếu giá trị thuộc tính: ${attrName} = ${attrValue}`);
      }

      await VariantValue.create({
        id_variant: variant.id_variant,
        id_value,
      }, { transaction });
    }

    const variantImage = isValidVariantImgIndex ? uploadedImages[variantImgIndex] : null;
    const mainAttrValue = values[mainAttrName];
    const mainValueId = mainAttrValue
      ? attributeValueMap[mainAttrName]?.[mainAttrValue.trim()]
      : null;

    if (variantImage && mainValueId) {
      await ProductImg.update(
        { is_main: false },
        {
          where: {
            id_products: newProduct.id_products,
            id_variant: variant.id_variant,
          },
          transaction,
        }
      );

      await ProductImg.create({
        id_products: newProduct.id_products,
        id_variant: variant.id_variant,
        id_value: mainValueId,
        Img_url: `/uploads/${variantImage.filename}`,
        is_main: true,
      }, { transaction });
    }
  }

  console.log("✅ Hoàn thành lưu variants.");
}

//update products
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const {
      products_name,
      products_slug,
      products_market_price,
      products_sale_price,
      products_status,
      products_description,
      products_quantity,
      products_shorts, 
      category_id,
      specs,
      optionImages,
      optionFileMeta,
      main_image_index,
      existingImages,
    } = req.body;

    // === 1. Cập nhật thông tin cơ bản ===
    if (products_name !== undefined) product.products_name = products_name;
    // if (products_slug !== undefined) product.products_slug = products_slug;
    if (products_shorts !== undefined) product.products_shorts = products_shorts;
    if (products_quantity !== undefined) product.products_quantity = products_quantity;
    if (products_market_price !== undefined) product.products_market_price = products_market_price;
    if (products_sale_price !== undefined) product.products_sale_price = products_sale_price;

    // Nếu có gửi slug, kiểm tra slug đó có trùng không
    if (products_slug !== undefined && products_slug.trim() !== '') {
      // Kiểm tra slug trùng với sản phẩm khác (không phải chính nó)
      const existingSlug = await Product.findOne({
        where: {
          products_slug: products_slug.trim(),
          id_products: { [Op.ne]: id },
        },
        transaction: t,
      });

      if (existingSlug) {
        await t.rollback();
        return res.status(400).json({ message: "Slug đã tồn tại, vui lòng chọn slug khác" });
      }

      product.products_slug = products_slug.trim();
    } else if (products_name !== undefined) {
      // Nếu không có slug gửi lên, hoặc rỗng, và có tên mới, tự động tạo slug từ tên
      const newSlug = await generateUniqueSlug(Product, products_name, id);
      product.products_slug = newSlug;
    }

    if (products_status !== undefined) {
      product.products_status = products_status;

      // Nếu sản phẩm bị ẩn thì gỡ ghim
      if (Number(products_status) === 3) {
        product.products_primary = false;
      }
    }

    if (products_description !== undefined) product.products_description = products_description;
    if (category_id && category_id !== "null") {
      product.category_id = parseInt(category_id);
    }

    // === 2. Cập nhật thông số kỹ thuật (specs) ===
    if (specs) {
      const specsParsed = JSON.parse(specs);
      const oldSpecs = await ProductSpec.findAll({ where: { id_products: id }, transaction: t });
      const oldMap = new Map(oldSpecs.map(s => [s.id_spec, s]));
      const newIds = specsParsed.filter(s => s.id_spec).map(s => Number(s.id_spec));

      // Xoá spec cũ không còn
      for (const oldSpec of oldSpecs) {
        if (!newIds.includes(oldSpec.id_spec)) {
          await oldSpec.destroy({ transaction: t });
        }
      }

      // Cập nhật hoặc thêm mới
      for (const spec of specsParsed) {
        if (spec.id_spec && oldMap.has(Number(spec.id_spec))) {
          const s = oldMap.get(Number(spec.id_spec));
          s.spec_name = spec.name;
          s.spec_value = spec.value;
          await s.save({ transaction: t });
        } else {
          await ProductSpec.create({
            id_products: id,
            spec_name: spec.name,
            spec_value: spec.value,
          }, { transaction: t });
        }
      }
    }

    // === 3. Ảnh OPTION (optionImages và optionFiles) ===

    // Parse ảnh option cũ
    // === 1. Xử lý attribute_values và gán product_attribute_values ===
    try {
      const attributes = typeof req.body.attributes === "string"
        ? JSON.parse(req.body.attributes)
        : req.body.attributes;

      // Map dùng cho việc lưu ảnh option mới
      req.tempIdMap = {};

      // 1. Lấy danh sách id_value hiện tại của sản phẩm
      const currentAttributeValues = await db.AttributeValue.findAll({
        include: [{
          model: db.ProductAttributeValue,
          as: 'productAttributeValues',
          where: { id_product: id }
        }],
        transaction: t,
      });

      const currentIds = currentAttributeValues.map(av => av.id_value);

      // 2. Lấy danh sách id_value được gửi từ frontend
      const newIds = [];
      attributes.forEach(attr => {
        (attr.values || []).forEach(val => {
          const idVal = val.value_id || val.id_value || val.idVal;
          if (idVal) newIds.push(Number(idVal));
        });
      });

      // 3. Tìm và xoá các giá trị không còn nữa
      for (const oldId of currentIds) {
        if (!newIds.includes(oldId)) {
          console.log(`🗑️ Bắt đầu xoá option không còn id_value=${oldId}`);

          // Xoá ảnh liên kết
          await db.ProductImg.destroy({
            where: { id_value: oldId },
            transaction: t,
          });

          // Xoá khỏi bảng trung gian
          await db.ProductAttributeValue.destroy({
            where: {
              id_product: id,
              id_value: oldId,
            },
            transaction: t,
          });

          // Kiểm tra nếu id_value này đang được dùng trong VariantValue (SKU) thì không cho xoá
          const isUsedInSku = await db.VariantValue.findOne({
            where: { id_value: oldId },
            transaction: t,
          });

          if (isUsedInSku) {
            await t.rollback();
            return res.status(400).json({
              message: `Option vẫn còn được sử dụng trong SKU`,
            });
          }

          // Nếu không bị dùng thì mới cho xoá
          await db.AttributeValue.destroy({
            where: { id_value: oldId },
            transaction: t,
          });

          console.log(`🗑️ Đã xoá option id_value=${oldId}`);
        }
      }

      // 4. Cập nhật hoặc thêm mới các giá trị được gửi từ frontend
      
      for (const attr of attributes) {
        let attributeId = attr.id_attribute;

          // Nếu chưa có id_attribute => tạo mới Attribute (option)
          if (!attributeId) {
            const newAttr = await db.Attribute.create({
              name: attr.name,
              type: attr.type || 1,
            }, { transaction: t });

            attributeId = newAttr.id_attribute;
            // Nếu muốn bạn có thể gán lại cho attr để dùng tiếp (nếu cần)
            attr.id_attribute = attributeId;
          } else {
            // Cập nhật tên attribute nếu khác
            const existingAttr = await db.Attribute.findByPk(attributeId, { transaction: t });
            if (existingAttr && existingAttr.name !== attr.name) {
              existingAttr.name = attr.name;
              await existingAttr.save({ transaction: t });
            }
          }

        for (const val of attr.values || []) {
          const idVal = val.value_id || val.id_value || val.idVal;
          const tempId = val.tempId || null;

          const extraPrice = val.extra_price ?? val.extraPrice ?? 0;
          const quantity = val.quantity ?? 0;
          const statusInput = val.status;

          const parsedExtraPrice = parseFloat(extraPrice);
          const parsedQuantity = parseInt(quantity, 10);
          const parsedStatus = [1, '1', true, 2, '2'].includes(statusInput) ? 1 : 0;

          if (
            isNaN(parsedExtraPrice) ||
            isNaN(parsedQuantity) ||
            typeof parsedStatus !== 'number'
          ) {
            console.warn(`⚠️ Dữ liệu không hợp lệ`, { val });
            continue;
          }

          let id_value = null;

          if (idVal) {
            const exists = await db.AttributeValue.findOne({
              where: { id_value: Number(idVal) },
              transaction: t,
            });

            if (exists) {
              exists.value = val.value?.toString() || '';
              exists.value_note = val.value_note || null;
              exists.extra_price = parsedExtraPrice;
              exists.quantity = parsedQuantity;
              exists.status = parsedStatus;
              await exists.save({ transaction: t });
              id_value = exists.id_value;
              console.log(`✅ Đã cập nhật id_value=${id_value}`);
            }
          }

          if (!id_value) {
            const newVal = await db.AttributeValue.create({
              id_attribute: attributeId,
              value: val.value?.toString() || '',
              value_note: val.value_note || null, // 👈 thêm dòng này
              extra_price: parsedExtraPrice,
              quantity: parsedQuantity,
              status: parsedStatus,
            }, { transaction: t });

            id_value = newVal.id_value;

            if (tempId) {
              req.tempIdMap[tempId] = id_value;
              console.log('📌 Mapping tempId → id_value:', tempId, '→', id_value);
            }
          }

          await db.ProductAttributeValue.findOrCreate({
            where: {
              id_product: id,
              id_value: id_value,
              // id_attribute: attributeId,
            },
            defaults: {
              id_product: id,
              id_value: id_value,
              // id_attribute: attributeId,
            },
            transaction: t,
          });

          console.log('🔗 Gắn vào bảng product_attribute_values:', {
            id_product: id,
            id_value,
            id_attribute: attributeId,
          });
        }
      }
      
      const attributeIds = attributes.map(attr => attr.id_attribute);

      // Xoá các product_attributes không còn nữa
      await db.ProductAttribute.destroy({
        where: {
          id_product: id,
          id_attribute: { [Op.notIn]: attributeIds },
        },
        transaction: t,
      });

      // Thêm mới nếu chưa có
      for (const attrId of attributeIds) {
        await db.ProductAttribute.findOrCreate({
          where: {
            id_product: id,
            id_attribute: attrId,
          },
          transaction: t,
        });
      }

    } catch (err) {
      await t.rollback();
      console.error("❌ Error updating attributes:", err);
      return res.status(500).json({
        message: "Lỗi khi cập nhật attributes",
        error: err.message,
      });
    }
    // === 2. Xử lý ảnh OPTION (optionImages và optionFiles) ===
    let parsedOptionImages = [];
    if (optionImages) {
      try {
        parsedOptionImages = typeof optionImages === "string" ? JSON.parse(optionImages) : optionImages;
      } catch (e) {
        console.error("Lỗi parse optionImages:", e);
      }
    }

    const keepOptionImgIds = parsedOptionImages.map(img => img.id_product_img).filter(Boolean);

    const oldOptionImgs = await ProductImg.findAll({
      where: { id_products: id, id_value: { [Op.ne]: null } },
      transaction: t,
    });

    // Xoá ảnh option cũ không còn dùng
    for (const img of oldOptionImgs) {
      if (!keepOptionImgIds.includes(img.id_product_img)) {
        const imgPath = path.join(__dirname, "../..", img.Img_url);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        await img.destroy({ transaction: t });
      }
    }

    // Upsert lại các ảnh cũ
    for (const img of parsedOptionImages) {
      if (!img.Img_url || !img.id_value) continue;
      await ProductImg.upsert({
        id_product_img: img.id_product_img || undefined,
        id_products: id,
        id_value: img.id_value,
        Img_url: img.Img_url,
        is_main: !!img.is_main,
        id_variant: null,
      }, { transaction: t });
    }

    // Xử lý ảnh mới (optionFiles)
    const optionFiles = req.files?.optionFiles || [];
    let optionFileMetas = [];

    try {
      if (typeof optionFileMeta === "string") {
        optionFileMetas = JSON.parse(optionFileMeta);
      } else if (Array.isArray(optionFileMeta)) {
        optionFileMetas = optionFileMeta.map(m => (typeof m === "string" ? JSON.parse(m) : m));
      }
    } catch (e) {
      console.error("Lỗi parse optionFileMeta:", e);
    }

    for (let i = 0; i < optionFiles.length; i++) {
      const file = optionFiles[i];
      const meta = optionFileMetas[i] || {};
      let idValue = meta.id_value;

      if (!idValue && meta.tempId && req.tempIdMap?.[meta.tempId]) {
        idValue = req.tempIdMap[meta.tempId];
        console.log('📌 Mapping tempId → id_value:', meta.tempId, '=>', idValue);
      }

      if (!idValue) {
        console.warn(`⚠️ Không có id_value cho ảnh option index=${i}`);
        continue;
      }

      const filename = path.basename(file.path);
      const dbPath = "/uploads/" + filename;

      await ProductImg.create({
        id_products: id,
        id_value: idValue,
        Img_url: dbPath,
        is_main: !!meta.is_main,
        id_variant: null,
      }, { transaction: t });

      console.log('🖼️ Đã lưu ảnh option mới:', dbPath);
    }

    // === 4. Ảnh CHUNG (images) ===

    // Parse existingImages
    let existingImagesParsed = [];
    try {
      if (typeof existingImages === "string") {
        const parsed = JSON.parse(existingImages);
        existingImagesParsed = Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(existingImages)) {
        existingImagesParsed = existingImages.map(e =>
          typeof e === "string" ? JSON.parse(e) : e
        );
      }
    } catch (e) {
      console.error("Lỗi parse existingImages:", e);
    }

    const keepImageIds = existingImagesParsed.map(img => img.id).filter(Boolean);
    const oldImages = await ProductImg.findAll({
      where: { id_products: id, id_variant: null, id_value: null },
      transaction: t,
    });

    for (const img of oldImages) {
      if (!keepImageIds.includes(img.id_product_img)) {
        const imgPath = path.join(__dirname, "../..", img.Img_url);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        await img.destroy({ transaction: t });
      }
    }

    // Thêm ảnh mới (images)
    const files = req.files?.images || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dbPath = "/uploads/" + path.basename(file.path);
      await ProductImg.create({
        id_products: id,
        Img_url: dbPath,
        is_main: false,
        id_variant: null,
        id_value: null,
      }, { transaction: t });
    }

    // Đặt lại ảnh đại diện
    const allImages = await ProductImg.findAll({
      where: { id_products: id, id_variant: null, id_value: null },
      order: [["id_product_img", "ASC"]],
      transaction: t,
    });

    const mainIndex = main_image_index != null && !isNaN(main_image_index) && main_image_index < allImages.length
      ? parseInt(main_image_index)
      : 0;

    for (let i = 0; i < allImages.length; i++) {
      await allImages[i].update({ is_main: i === mainIndex }, { transaction: t });
    }

    // === 6. Cập nhật SKU ===
    try {
      let skus = req.body.skus;
      if (typeof skus === "string") {
        skus = JSON.parse(skus);
      }
      if (!Array.isArray(skus)) {
        skus = [];
      }

      console.log("SKUs received:", skus);

      const existingVariants = await db.ProductVariant.findAll({
        where: { id_products: id },
        include: [{ model: db.VariantValue, as: 'variantValues' }],
        transaction: t,
      });

      const existingVariantIds = existingVariants.map(v => v.id_variant);
      // Chú ý dùng id_variant thay vì variant_id
      const incomingVariantIds = skus.filter(s => s.id_variant).map(s => s.id_variant);

      console.log("Existing variant IDs:", existingVariantIds);
      console.log("Incoming variant IDs:", incomingVariantIds);

      // Xóa variant cũ không còn trong danh sách mới
      const removedIds = existingVariantIds.filter(idVar => !incomingVariantIds.includes(idVar));
      if (removedIds.length > 0) {
        console.log("Removing variants:", removedIds);
        await db.VariantValue.destroy({ where: { id_variant: removedIds }, transaction: t });
        await db.ProductVariant.destroy({ where: { id_variant: removedIds }, transaction: t });
      }

      for (const sku of skus) {
        const {
          id_variant,  // dùng id_variant
          sku_code,
          quantity,
          price,
          price_sale,
          status,
          option_combo = [],
        } = sku;

        console.log("Processing SKU:", sku);

        const parsedStatus = [1, '1', true, 'true'].includes(status) ? true : false;

        if (id_variant) {
          // Cập nhật SKU cũ
          await db.ProductVariant.update({
            sku: sku_code,
            quantity: parseInt(quantity) || 0,
            price: parseFloat(price) || 0,
            price_sale: parseFloat(price_sale) || 0,
            status: parsedStatus,
          }, {
            where: { id_variant: id_variant },
            transaction: t,
          });

          // Xóa VariantValue cũ
          await db.VariantValue.destroy({
            where: { id_variant: id_variant },
            transaction: t,
          });

          // Tạo VariantValue mới
          for (const combo of option_combo) {
            console.log("Option combo item:", combo);

            let attrVal = null;

            if (combo.id_value) {
              attrVal = await db.AttributeValue.findOne({
                where: { id_value: combo.id_value },
                transaction: t,
              });
            }

            // Nếu không có hoặc không tìm thấy → fallback tìm bằng value + attribute name
            if (!attrVal) {
              attrVal = await db.AttributeValue.findOne({
                where: { value: combo.value?.toString() || '' },
                include: [{
                  model: db.Attribute,
                  as: 'attribute',
                  where: { name: combo.attribute }
                }],
                transaction: t
              });
            }

            if (attrVal) {
              console.log("Found AttributeValue:", attrVal.id_value);
              await db.VariantValue.create({
                id_variant: id_variant,
                id_value: attrVal.id_value
              }, { transaction: t });
            } else {
              console.warn("Không tìm thấy AttributeValue cho combo:", combo);
            }
          }

        } else {
          // Tạo mới SKU
          const newVariant = await db.ProductVariant.create({
            id_products: id,
            sku: sku_code,
            quantity: parseInt(quantity) || 0,
            price: parseFloat(price) || 0,
            price_sale: parseFloat(price_sale) || 0,
            status: parsedStatus,
          }, { transaction: t });

          for (const combo of option_combo) {
            const attrVal = await db.AttributeValue.findOne({
              where: { value: combo.value?.toString() || '' },
              include: [{
                model: db.Attribute,
                as: 'attribute',
                where: { name: combo.attribute }
              }],
              transaction: t
            });

            if (attrVal) {
              await db.VariantValue.create({
                id_variant: newVariant.id_variant,
                id_value: attrVal.id_value
              }, { transaction: t });
            }
          }
        }
      }
    } catch (error) {
      await t.rollback();
      console.error("❌ Lỗi cập nhật SKU:", error);
      return res.status(500).json({ message: "Lỗi khi cập nhật SKU", error: error.message });
    }

    // === 5. Lưu lại product ===
    await product.save({ transaction: t });
    await t.commit();

    return res.json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    await t.rollback();
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//getProductByid
exports.getProductsByIdforAdmin = async (req, res) => {

  const id = req.params.id;

  try {
    // 1. Thông tin sản phẩm chính
    const product = await Product.findOne({
      where: { id_products: id },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'name', 'parent_id'],
          include: [
            {
              model: Category,
              as: 'parent',
              attributes: ['category_id', 'name'],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // console.log('Product with category:', JSON.stringify(product.toJSON(), null, 2)); // Debug

    // const id= product.id_products;

    // 2. Ảnh sản phẩm
    const images = await ProductImg.findAll({
      where: { 
        id_products: id,
        id_value: null,
        id_variant: null,
        is_main: true 
      },
    });

    // 3. Thông số kỹ thuật
    const specs = await ProductSpec.findAll({
      where: { id_products: id },
    });

    // 4. Lấy attribute kèm giá trị thuộc sản phẩm chính xác
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
                {
                  model: ProductImg,
                  as: 'images',
                  where: { id_products: id },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    // console.log('ProductAttribute sample:', JSON.stringify(productAttributes, null, 2));
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
          images: v.images || [],
        }))
      };
    });

    // 5. Lấy SKU + option combo + ảnh SKU nếu có
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
        // {
        //   model: ProductImg,
        //   as: 'images',
        // },
      ],
    });

    const skus = variantsRaw
      .filter(variant => variant.variantValues.length === attributes.length)
      .map(variant => ({
        variant_id: variant.id_variant,
        quantity: variant.quantity,
        price: variant.price,
        price_sale: variant.price_sale,
        status: variant.status,
        // images: variant.images || [],
        option_combo: variant.variantValues.map(v => ({
          // id_value: v.attributeValue?.attribute?.id_value,
          attribute: v.attributeValue?.attribute?.name,
          value: v.attributeValue?.value,
          type: v.attributeValue.attribute?.type,
          id_value: v.attributeValue?.id_value,
      })),
    }));

    // Xác định loại sản phẩm (giống như getAllProducts)
    let productType = 1;

    if (skus && skus.length > 0) {
      productType = 3;
    } else if (attributes && attributes.length > 0) {
      productType = 2;
    }

    // Tính giá hiển thị đúng theo loại
    let originalPrice = parseFloat(product.products_market_price) || 0;
    let salePrice = parseFloat(product.products_sale_price) || 0;

    if (productType === 2) {
      // Lấy giá nhỏ nhất từ extra_price
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


    // Format response để khớp với frontend
    const response = {
      product: {
        id_products: product.id_products,
        products_name: product.products_name,
        products_slug: product.products_slug,
        products_shorts: product.products_shorts,
        products_market_price: product.products_market_price,
        products_sale_price: product.products_sale_price,
        products_description: product.products_description,
        products_quantity: product.products_quantity,
        products_status: product.products_status,
        products_primary: product.products_primary,
        //price for customers
        salePrice: salePrice,
        marketPrice: originalPrice,

      },
      category: product.category || null,
      images,
      specs,
      attributes,
      skus,
    };

    // console.log('Final response:', JSON.stringify(response, null, 2)); // Debug
    return res.json(response);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message || error,
    });
  }
};

//getProductByid
exports.getProductsById = async (req, res) => {
  const slug = req.params.slug;

  try {
    // 1. Thông tin sản phẩm chính
    const product = await Product.findOne({
      where: { products_slug: slug },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'name', 'parent_id'],
          include: [
            {
              model: Category,
              as: 'parent',
              attributes: ['category_id', 'name'],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // console.log('Product with category:', JSON.stringify(product.toJSON(), null, 2)); // Debug

    const id= product.id_products;

    // 2. Ảnh sản phẩm
    const images = await ProductImg.findAll({
      where: { 
        id_products: id,
        id_value: null,
        id_variant: null,
        is_main: true 
      },
    });

    // 3. Thông số kỹ thuật
    const specs = await ProductSpec.findAll({
      where: { id_products: id },
    });

    // 4. Lấy attribute kèm giá trị thuộc sản phẩm chính xác
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
                {
                  model: ProductImg,
                  as: 'images',
                  where: { id_products: id },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    // console.log('ProductAttribute sample:', JSON.stringify(productAttributes, null, 2));
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
          images: v.images || [],
        }))
      };
    });

    // 5. Lấy SKU + option combo + ảnh SKU nếu có
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
        // {
        //   model: ProductImg,
        //   as: 'images',
        // },
      ],
    });

    const skus = variantsRaw
      .filter(variant => variant.variantValues.length === attributes.length)
      .map(variant => ({
        variant_id: variant.id_variant,
        quantity: variant.quantity,
        price: variant.price,
        price_sale: variant.price_sale,
        status: variant.status,
        // images: variant.images || [],
        option_combo: variant.variantValues.map(v => ({
          // id_value: v.attributeValue?.attribute?.id_value,
          attribute: v.attributeValue?.attribute?.name,
          value: v.attributeValue?.value,
          type: v.attributeValue.attribute?.type,
          id_value: v.attributeValue?.id_value,
      })),
    }));

    // Xác định loại sản phẩm (giống như getAllProducts)
    let productType = 1;

    if (skus && skus.length > 0) {
      productType = 3;
    } else if (attributes && attributes.length > 0) {
      productType = 2;
    }

    // Tính giá hiển thị đúng theo loại
    let originalPrice = parseFloat(product.products_market_price) || 0;
    let salePrice = parseFloat(product.products_sale_price) || 0;

    if (productType === 2) {
      // Lấy giá nhỏ nhất từ extra_price
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


    // Format response để khớp với frontend
    const response = {
      product: {
        id_products: product.id_products,
        products_name: product.products_name,
        products_slug: product.products_slug,
        products_shorts: product.products_shorts,
        products_market_price: product.products_market_price,
        products_sale_price: product.products_sale_price,
        products_description: product.products_description,
        products_quantity: product.products_quantity,
        products_status: product.products_status,
        products_primary: product.products_primary,
        //price for customers
        salePrice: salePrice,
        marketPrice: originalPrice,

      },
      category: product.category || null,
      images,
      specs,
      attributes,
      skus,
    };

    // console.log('Final response:', JSON.stringify(response, null, 2)); // Debug
    return res.json(response);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message || error,
    });
  }
};

//get all products 
exports.getAllProducts = async (req, res) => {
  try {
    const { search = "", category_id, parent_id, status, primary, page = 1, limit = 7 } = req.query;

    const whereClause = {};

    if (category_id) {
      whereClause.category_id = parseInt(category_id);
    } else if (parent_id) {
      const allIds = await getAllChildCategoryIds(parseInt(parent_id));
      whereClause.category_id = { [Op.in]: allIds };
    }

    if (status !== undefined && status !== "") {
      whereClause.products_status = parseInt(status);
    }

    if (primary !== undefined && primary !== "") {
      whereClause.products_primary = primary === "true";
    }

    if (search) {
      whereClause.products_name = { [Op.like]: `%${search}%` };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ProductImg,
          as: "images",
          where: { is_main: true, id_value: null, id_variant: null },
          required: false,
          attributes: ["Img_url", "is_main"],
        },
        {
          model: ProductVariant,
          as: 'variants',
          required: false,
          attributes: ['id_variant', 'price', 'price_sale'],
        },
        {
          model: ProductAttributeValue,
          as: 'productAttributeValues',
          required: false,
          include: [
            {
              model: AttributeValue,
              as: 'attributeValue',
              attributes: ['id_value', 'value', 'extra_price'],
            }
          ],
        }
      ],
      distinct: true,
      order: [["id_products", "DESC"]],
      limit: limitNum,
      offset,
    });

    // map dữ liệu để xử lý giá theo logic productType ở backend
    const formattedProducts = rows.map(p => {
      
      // Tự xác định productType
      let productType = 1;

      if (p.variants && p.variants.length > 0) {
        productType = 3;
      } else if (p.productAttributeValues && p.productAttributeValues.length > 0) {
        productType = 2;
      }

      let marketPrice = parseFloat(p.products_market_price) || 0;
      let salePrice = parseFloat(p.products_sale_price) || 0;

      if (productType === 2) {

        // Giá thị trường giữ nguyên
        const extraPrices = p.productAttributeValues
          .map(item => parseFloat(item?.attributeValue?.extra_price))
          .filter(val => !isNaN(val));

        if (extraPrices.length > 0) {
          salePrice = Math.min(...extraPrices);
        }

      } else if (productType === 3) {

        const variantPrices = p.variants.map(v => parseFloat(v.price)).filter(v => !isNaN(v));
        const variantSalePrices = p.variants.map(v => parseFloat(v.price_sale)).filter(v => !isNaN(v));

        if (variantPrices.length > 0) marketPrice = Math.min(...variantPrices);
        if (variantSalePrices.length > 0) salePrice = Math.min(...variantSalePrices);

      }

      return {
        products_id: p.id_products,
        products_name: p.products_name,
        market_price: marketPrice,
        sale_price: salePrice,
        products_primary: Boolean(p.products_primary),
        products_status: p.products_status,
        main_image_url: p.images?.[0]?.Img_url || null,
        category_id: p.category_id,
        productType,
      };
    });

    res.json({
      products: formattedProducts,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        pageSize: limitNum,
      }
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//primary products
exports.togglePrimary = async (req, res) => {
  const productId = req.params.id;
  const { products_primary } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    product.products_primary = products_primary; // 1 = không ghim, 2 = ghim
    await product.save();

    res.json({ message: "Cập nhật trạng thái ghim thành công." });
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái ghim:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái ghim." });
  }
};

// delete products
// deleteProductHard.js
exports.deleteProductHard = async (req, res) => {

  const { id } = req.params;

  try {
    // Tìm các variants của sản phẩm
    const variants = await ProductVariant.findAll({ where: { id_products: id } });
    const variantIds = variants.map(v => v.id_variant);

    if (variantIds.length > 0) {
      // Xóa các variant_values theo id_variant
      await VariantValue.destroy({ where: { id_variant: variantIds } });
    }

    // Xóa các product_variants
    await ProductVariant.destroy({ where: { id_products: id } });

    // Xóa các thông số kỹ thuật
    await ProductSpec.destroy({ where: { id_products: id } });

    // Xóa ảnh sản phẩm
    await ProductImg.destroy({ where: { id_products: id } });

    // Xóa các product_attributes
    await ProductAttribute.destroy({ where: { id_product: id } });

    // Xóa product_attribute_value (nối sản phẩm và value)
    await ProductAttributeValue.destroy({ where: { id_product: id } });

    // ❗ Không xóa Attribute hoặc AttributeValue tại đây nếu dùng chung cho nhiều sản phẩm

    // Cuối cùng, xóa sản phẩm
    await Product.destroy({ where: { id_products: id } });

    return res.status(200).json({ message: `Đã xóa sản phẩm ${id} và toàn bộ dữ liệu liên quan.` });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    return res.status(500).json({ message: 'Xóa thất bại.', error });
  }

  
};

//getProductByidforAdmin
exports.getProductsByIdforAdmin = async (req, res) => {
    // ... code hàm getProductsByIdforAdmin ...
    
}; 


// products.controller.js
exports.getTopProducts = async (req, res) => {
    try {
        // ✅ BỎ QUA TRUY VẤN DATABASE VÀ TRẢ VỀ DỮ LIỆU CỐ ĐỊNH (MOCK DATA)
        const mockProducts = [
            {
                products_id: 999,
                products_slug: "iphone-test-15",
                products_name: "Sản phẩm TEST MẪU",
                main_image_url: "https://via.placeholder.com/150/FF0000/FFFFFF?text=TEST", // Ảnh tạm màu đỏ
                market_price: 30000000,
                sale_price: 28000000,
                productType: 1,
            }
        ];

        console.log("➡️ Sản phẩm được trả về (MOCK DATA):", mockProducts.length);
        
        // Trả về dữ liệu giả lập cho Frontend
        return res.status(200).json({ products: mockProducts }); 
        
    } catch (error) {
        console.error("❌ Lỗi Server khi lấy Top Products:", error);
        return res.status(500).json({ message: "Lỗi Server - Top Products" });
    }
};