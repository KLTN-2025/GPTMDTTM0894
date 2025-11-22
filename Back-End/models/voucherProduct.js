module.exports = (sequelize, DataTypes) => {
  const VoucherProduct = sequelize.define('VoucherProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_voucher: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'voucher_products',
    timestamps: false
  });

  return VoucherProduct;
};
