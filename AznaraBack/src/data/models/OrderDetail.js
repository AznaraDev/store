const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'OrderDetail',
    {
      id_orderDetail: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
     amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      address:{
        type: DataTypes.ENUM('Envio a domicilio', 'Retira en local'),
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      state_order:{
      type: DataTypes.ENUM('Pedido Realizado', 'En Preparación', 'Listo para entregar','Envío Realizado', 'Retirado'),
        allowNull: false,
      },
      integritySignature:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser null hasta que se agregue el número de seguimiento
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