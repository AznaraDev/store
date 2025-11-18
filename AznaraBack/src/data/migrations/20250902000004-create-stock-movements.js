'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('StockMovements')) {
      // Crear tabla StockMovements
      await queryInterface.createTable('StockMovements', {
        id_movement: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        
        id_product: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Products',
            key: 'id_product'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        
        movement_type: {
          type: Sequelize.ENUM('entrada', 'salida', 'ajuste', 'venta', 'devolucion'),
          allowNull: false,
        },
        
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        
        previous_stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        
        new_stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        
        reason: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        
        performed_by: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        
        reference_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
        
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
      });

      // Crear índices
      await queryInterface.addIndex('StockMovements', ['id_product']);
      await queryInterface.addIndex('StockMovements', ['movement_type']);
      await queryInterface.addIndex('StockMovements', ['createdAt']);

      console.log('✅ Tabla StockMovements creada con índices');
    } else {
      console.log('⚠️ Tabla StockMovements ya existe');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    
    if (tables.includes('StockMovements')) {
      await queryInterface.dropTable('StockMovements');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_StockMovements_movement_type";');
      console.log('❌ Tabla StockMovements eliminada');
    }
  }
};
