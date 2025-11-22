module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    'Address',
    {
      id_address: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_customer: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address_label: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      name_city: DataTypes.STRING,
      name_ward: DataTypes.STRING,
      name_address: DataTypes.STRING,
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'customer_address', // 👈 Thêm dòng này để fix tên bảng
      timestamps: false,
    }
  );

  return Address;
};
