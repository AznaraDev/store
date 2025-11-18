'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('OrderDetails', 'cart_items', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Array of cart items with variant details (selectedColor, selectedSize, selectedMaterial, name, price, image, etc.)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('OrderDetails', 'cart_items');
  }
};
