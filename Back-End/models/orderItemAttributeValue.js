module.exports = (sequelize, DataTypes) => {
  const OrderItemAttributeValue = sequelize.define('OrderItemAttributeValue', {
    id: 
        { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
    id_order_detail: 
        { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    id_value: 
        { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        }
  }, {
    tableName: 'order_item_attribute_values',
    timestamps: false
  });

  return OrderItemAttributeValue;
};
