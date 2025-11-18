const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'StockMovement',
    {
      id_movement: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      
      movement_type: {
        type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'venta', 'devolucion'),
        allowNull: false,
        
      },
      
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Cantidad del movimiento (positivo o negativo)'
      },
      
      previous_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Stock antes del movimiento'
      },
      
      new_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Stock después del movimiento'
      },
      
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Motivo del movimiento'
      },
      
      performed_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Documento del usuario que realizó el movimiento'
      },
      
      reference_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de referencia (ej: id de venta, id de compra)'
      },
      
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales'
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
          fields: ['id_product']
        },
        {
          fields: ['movement_type']
        },
        {
          fields: ['createdAt']
        }
      ]
    }
  );
};
