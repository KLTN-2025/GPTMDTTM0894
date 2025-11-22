module.exports = (sequelize, DataTypes) => {
  const VariantValue = sequelize.define("VariantValue", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_variant: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: "variant_values",
    timestamps: false,
  });

  return VariantValue;
};
