const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'Payment',
    {
      id_payment: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true,
        allowNull: false,
      },
      
      payment_state: {
        type: DataTypes.ENUM("Pago", "Pendiente", "Rechazado", "Error"),
        allowNull: false,
        defaultValue: "Pendiente"
      },
      
      // Información de Wompi
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      
      reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      amount_in_cents: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      
      payment_method_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'COP'
      },
      
      customer_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      paranoid: true,
    }
  );
};