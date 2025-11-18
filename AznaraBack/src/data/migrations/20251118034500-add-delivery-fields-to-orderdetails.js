'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('OrderDetails');
    
    // Agregar recipient_name si no existe
    if (!tableInfo.recipient_name) {
      await queryInterface.addColumn('OrderDetails', 'recipient_name', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nombre completo del destinatario para el envío'
      });
    }
    
    // Agregar recipient_phone si no existe
    if (!tableInfo.recipient_phone) {
      await queryInterface.addColumn('OrderDetails', 'recipient_phone', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Teléfono de contacto del destinatario'
      });
    }
    
    // Agregar city si no existe
    if (!tableInfo.city) {
      await queryInterface.addColumn('OrderDetails', 'city', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Ciudad de entrega'
      });
    }
    
    // Agregar postal_code si no existe
    if (!tableInfo.postal_code) {
      await queryInterface.addColumn('OrderDetails', 'postal_code', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Código postal'
      });
    }
    
    // Agregar delivery_notes si no existe
    if (!tableInfo.delivery_notes) {
      await queryInterface.addColumn('OrderDetails', 'delivery_notes', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales para la entrega (ej: referencias, instrucciones)'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OrderDetails', 'recipient_name');
    await queryInterface.removeColumn('OrderDetails', 'recipient_phone');
    await queryInterface.removeColumn('OrderDetails', 'city');
    await queryInterface.removeColumn('OrderDetails', 'postal_code');
    await queryInterface.removeColumn('OrderDetails', 'delivery_notes');
  }
};
