'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Payments');
    
    // 1. Agregar nuevos estados al ENUM de payment_state
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Payments_payment_state" ADD VALUE IF NOT EXISTS 'Rechazado';
      ALTER TYPE "enum_Payments_payment_state" ADD VALUE IF NOT EXISTS 'Error';
    `);
    console.log('✅ Nuevos estados agregados a payment_state ENUM');

    // 2. Agregar nuevos campos a Payments
    if (!tableInfo.transaction_id) {
      await queryInterface.addColumn('Payments', 'transaction_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
      console.log('✅ Campo transaction_id agregado a Payments');
    } else {
      console.log('⚠️ Campo transaction_id ya existe en Payments');
    }

    if (!tableInfo.reference) {
      await queryInterface.addColumn('Payments', 'reference', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('✅ Campo reference agregado a Payments');
    } else {
      console.log('⚠️ Campo reference ya existe en Payments');
    }

    if (!tableInfo.amount_in_cents) {
      await queryInterface.addColumn('Payments', 'amount_in_cents', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      console.log('✅ Campo amount_in_cents agregado a Payments');
    } else {
      console.log('⚠️ Campo amount_in_cents ya existe en Payments');
    }

    if (!tableInfo.payment_method_type) {
      await queryInterface.addColumn('Payments', 'payment_method_type', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('✅ Campo payment_method_type agregado a Payments');
    } else {
      console.log('⚠️ Campo payment_method_type ya existe en Payments');
    }

    if (!tableInfo.status) {
      await queryInterface.addColumn('Payments', 'status', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('✅ Campo status agregado a Payments');
    } else {
      console.log('⚠️ Campo status ya existe en Payments');
    }

    if (!tableInfo.currency) {
      await queryInterface.addColumn('Payments', 'currency', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'COP'
      });
      console.log('✅ Campo currency agregado a Payments');
    } else {
      console.log('⚠️ Campo currency ya existe en Payments');
    }

    if (!tableInfo.customer_email) {
      await queryInterface.addColumn('Payments', 'customer_email', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('✅ Campo customer_email agregado a Payments');
    } else {
      console.log('⚠️ Campo customer_email ya existe en Payments');
    }

    console.log('✅ Migración de Payments completada');
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Payments');
    
    // Revertir cambios en orden inverso
    const columnsToRemove = [
      'customer_email',
      'currency',
      'status',
      'payment_method_type',
      'amount_in_cents',
      'reference',
      'transaction_id'
    ];

    for (const columnName of columnsToRemove) {
      if (tableInfo[columnName]) {
        await queryInterface.removeColumn('Payments', columnName);
        console.log(`❌ Campo ${columnName} eliminado de Payments`);
      }
    }

    // Nota: PostgreSQL no permite eliminar valores de ENUM fácilmente
    // Se requeriría recrear el tipo completamente
    console.log('⚠️  Los valores del ENUM no se eliminan automáticamente');
  }
};
