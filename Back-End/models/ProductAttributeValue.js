module.exports = (sequelize, DataTypes) => {
  const ProductAttributeValue = sequelize.define('ProductAttributeValue', {
    id_product_attribute_value: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id_products',
      }
    },
    id_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'attribute_values',
        key: 'id_value',
      }
    }
  }, {
    tableName: 'product_attribute_values',
    timestamps: false,
  });

  return ProductAttributeValue;
};
