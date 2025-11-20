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
      address: {
        type: DataTypes.ENUM('Envio a domicilio', 'Retira en local'),
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      recipient_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre completo del destinatario para el envío'
      },
      recipient_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Teléfono de contacto del destinatario'
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Ciudad de entrega'
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Código postal'
      },
      delivery_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales para la entrega (ej: referencias, instrucciones)'
      },
      cart_items: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array of cart items with variant details (selectedColor, selectedSize, selectedMaterial, name, price, image, etc.)'
      },
      state_order: {
        type: DataTypes.ENUM('Pedido Realizado', 'En Preparación', 'Listo para entregar', 'Envío Realizado', 'Retirado'),
        allowNull: false,
        defaultValue: 'Pedido Realizado',
      },
      payment_method: {
        type: DataTypes.ENUM('Pago en local', 'Pago contra entrega', 'Pago online (Wompi)'),
        allowNull: false,
        defaultValue: 'Pago en local',
        comment: 'Método de pago seleccionado por el cliente'
      },
      integritySignature: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Referencia única de Wompi para rastrear la transacción'
      },
      transaction_status: {
        type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado', 'Fallido', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Pendiente',  
      },
      trackingNumber: {
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
      indexes: [
        {
          unique: true,
          fields: ['reference'],
          name: 'orderdetails_reference_unique'
        }
      ]
    }
  );
};

