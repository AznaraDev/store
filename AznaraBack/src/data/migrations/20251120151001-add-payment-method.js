'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OrderDetails', 'payment_method', {
      type: Sequelize.ENUM('Pago en local', 'Pago contra entrega', 'Pago online (Wompi)'),
      allowNull: false,
      defaultValue: 'Pago en local',
      comment: 'Método de pago seleccionado por el cliente'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OrderDetails', 'payment_method');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OrderDetails_payment_method";');
  }
};
