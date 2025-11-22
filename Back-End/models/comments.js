// models/product_review.model.js
module.exports = (sequelize, DataTypes) => {
  const ProductReview = sequelize.define("ProductReview", {
    id_review: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_customer: { type: DataTypes.INTEGER, allowNull: false },
    id_products: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING },
    comment: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    approved: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
  }, {
    tableName: "product_reviews",
    timestamps: false,
  });

  return ProductReview;
};
