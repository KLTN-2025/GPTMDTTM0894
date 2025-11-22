module.exports = (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define("AttributeValue", {
    id_value: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_attribute: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    value_note: DataTypes.TEXT,
    quantity: DataTypes.INTEGER,
    extra_price: DataTypes.DECIMAL(10, 2),
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    }
  }, {
    tableName: "attribute_values",
    timestamps: false,
  });

  return AttributeValue;
};
