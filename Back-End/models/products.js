// models/products.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
      id_products: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      category_id: { 
        type: DataTypes.INTEGER },

      products_name: { 
        type: DataTypes.STRING },
      
      products_slug: { 
        type: DataTypes.STRING,
        unique:true           },

      products_shorts: {
        type: DataTypes.TEXT},
          
      products_market_price: { 
        type: DataTypes.DECIMAL(10, 2) },

      products_sale_price: { 
        type: DataTypes.DECIMAL(10, 2) },

      products_quantity: {
        type: DataTypes.INTEGER
      },

      products_description: { 
        type: DataTypes.TEXT },

      products_status: { 
        type: DataTypes.TINYINT, // hoặc INTEGER
        allowNull: false,
        defaultValue: 1,
        },
      products_primary: { 
        type: DataTypes.TINYINT,

      defaultValue: false }
  }, {
    tableName: "products",
    timestamps: false
  });

 

  return Product;
};
