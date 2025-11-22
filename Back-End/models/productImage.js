module.exports = (sequelize, DataTypes) => {
  const ProductImg = sequelize.define("ProductImg", {
    id_product_img: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true },
    id_products: { 
      type: DataTypes.INTEGER, 
      allowNull: true },
    id_variant: { 
      type: DataTypes.INTEGER, 
      allowNull: true },
    id_value: { 
      type: DataTypes.INTEGER, 
      allowNull: true },
    Img_url: { 
      type: DataTypes.STRING },
    is_main: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false }
  }, {
    tableName: "product_img",
    timestamps: false
  });

  return ProductImg;
};
