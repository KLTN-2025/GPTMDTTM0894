module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id_payment: 
        { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
    id_order: 
        { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
    vnp_transaction_no: 
        { 
            type: DataTypes.STRING(255), 
            allowNull: true 
        },
    payment_status: 
        {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: false 
        },
    payment_time: 
        { 
            type: DataTypes.DATE, 
            allowNull: true 
        }
  }, {
    tableName: 'payments',
    timestamps: false
  });

  return Payment;
};
