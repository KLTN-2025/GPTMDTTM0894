module.exports = (sequelize, DataTypes) => {
  const ShippingInfo = sequelize.define('ShippingInfo', {
    id_shipping: 
        { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
    id_order: 
        { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    shipping_code: 
        { 
            type: DataTypes.STRING(100), 
            allowNull: true 
        },
    shipping_status: 
        { 
            type: DataTypes.STRING(100), 
            allowNull: true 
        },
    expected_delivery: 
        { 
            type: DataTypes.DATE, 
            allowNull: true 
        },
    shipped_at: 
        { 
            type: DataTypes.DATE, 
            allowNull: true 
        },
    delivered_at: 
        { 
            type: DataTypes.DATE, 
            allowNull: true 
        }
  }, {
    tableName: 'shipping_info',
    timestamps: false
  });

  return ShippingInfo;
};
