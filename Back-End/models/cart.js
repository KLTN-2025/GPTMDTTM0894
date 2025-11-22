module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('cart', {
    id_cart: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'carts',
    timestamps: false
  });

  return Cart;
};
