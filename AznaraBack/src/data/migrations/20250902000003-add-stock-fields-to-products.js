'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Products');
    
    if (!tableInfo.min_stock) {
      await queryInterface.addColumn('Products', 'min_stock', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 5,
        comment: 'Stock mínimo antes de alertar'
      });
      console.log('✅ Campo min_stock agregado a Products');
    } else {
      console.log('⚠️ Campo min_stock ya existe en Products');
    }

    if (!tableInfo.max_stock) {
      await queryInterface.addColumn('Products', 'max_stock', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 100,
        comment: 'Stock máximo recomendado'
      });
      console.log('✅ Campo max_stock agregado a Products');
    } else {
      console.log('⚠️ Campo max_stock ya existe en Products');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Products');
    
    if (tableInfo.min_stock) {
      await queryInterface.removeColumn('Products', 'min_stock');
    }
    if (tableInfo.max_stock) {
      await queryInterface.removeColumn('Products', 'max_stock');
    }
    console.log('❌ Campos min_stock y max_stock eliminados de Products');
  }
};
