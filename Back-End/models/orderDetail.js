const productAttribute = require("./productAttribute");

module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define('OrderDetail', {
    id_order_detail: 
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
    id_product: 
        { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    products_item: 
        { 
            type: DataTypes.STRING,
            allowNull: true 
        },
    product_name: 
        { 
            type: DataTypes.STRING,
            allowNull: false 
        },
    quantity: 
        { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    final_price: 
        { 
            type: DataTypes.DECIMAL, 
            allowNull: false 
        },
  }, {
    tableName: 'order_details',
    timestamps: false
  });

  return OrderDetail;
};
