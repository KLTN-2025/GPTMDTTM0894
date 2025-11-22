module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    id_banner: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    banner_img: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_primary: {
      type:DataTypes.TINYINT,
      allowNull: true,
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull:true,
    },
  }, {
    tableName: 'Banner',
    timestamps: false
  });

  return Banner;
};
