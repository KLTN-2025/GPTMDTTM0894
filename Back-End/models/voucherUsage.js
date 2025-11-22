module.exports = (sequelize, DataTypes) => {
  const VoucherUsage = sequelize.define('voucher_usage', {
    id_voucher_usage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_voucher: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    usage_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    
  }, {
    tableName: 'voucher_usage',
    timestamps: false // vì bạn dùng create_date custom, không dùng createdAt
  });

  return VoucherUsage;
};
