module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define("ProductVariant", {
    id_variant: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_products: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    price: DataTypes.DECIMAL(10, 2),
    price_sale: DataTypes.DECIMAL(10, 2),
    quantity: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
  }, {
    tableName: "product_variants",
    timestamps: false,
  });

  return ProductVariant;
};
