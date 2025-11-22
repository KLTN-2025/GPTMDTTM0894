module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id_employee: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: false, // 1: Nam, 2: Nữ
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('1', '2', '3'), // 1: đi làm, 2: nghỉ phép, 3: nghỉ việc
      defaultValue: '1',
    },
    role: {
      type: DataTypes.INTEGER, // 1: Super Admin, 2: Seller
      allowNull: false,
    },
    block: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    block_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'employees',
    timestamps: false,
  });

  return Employee;
};
