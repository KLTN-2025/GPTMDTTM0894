module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id_contact: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1: chưa xử lý, 2: đã xử lý
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // tạo mặc định theo thời gian hiện tại
    },
  }, {
    tableName: 'contact',
    timestamps: false, // vì bạn tự quản lý created_at
    underscored: true, // nếu bạn muốn cột snake_case: created_at thay vì createdAt
  });

  return Contact;
};
