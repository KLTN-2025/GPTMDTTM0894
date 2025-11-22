module.exports = (sequelize, DataTypes) => {
  const ProductSpec = sequelize.define("ProductSpec", {
    id_spec: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true },
    id_products: { 
      type: DataTypes.INTEGER },
    spec_name: { 
      type: DataTypes.STRING },
    spec_value: { 
      type: DataTypes.STRING }
  }, {
    tableName: "product_spec",
    timestamps: false
  });

  return ProductSpec;
};
