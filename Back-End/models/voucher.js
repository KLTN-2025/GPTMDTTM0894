module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define('Voucher', {
    id_voucher: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(225),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('percent', 'fixed'),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    min_order_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    user_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1 // 1: chờ duyệt
    }
  }, {
    tableName: 'vouchers',
    timestamps: false // vì bạn dùng create_date custom, không dùng createdAt
  });

  return Voucher;
};
