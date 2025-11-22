module.exports = (sequelize, DataTypes) => {
  const CartItemAttributeValue = sequelize.define('cartItemAttributeValues', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_cart_items: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'cart_item_attribute_values',
    timestamps: false
  });

  return CartItemAttributeValue;
};
