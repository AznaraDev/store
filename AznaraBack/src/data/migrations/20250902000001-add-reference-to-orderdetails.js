'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('OrderDetails');
    
    if (!tableInfo.reference) {
      // La columna no existe, crearla
      await queryInterface.addColumn('OrderDetails', 'reference', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        comment: 'Referencia única de Wompi para rastrear la transacción'
      });
      console.log('✅ Campo reference agregado a OrderDetails');
    } else {
      // La columna ya existe, verificar si tiene el constraint UNIQUE
      console.log('⚠️ Campo reference ya existe en OrderDetails');
      
      // Intentar agregar el constraint UNIQUE si no existe
      try {
        await queryInterface.addConstraint('OrderDetails', {
          fields: ['reference'],
          type: 'unique',
          name: 'orderdetails_reference_unique'
        });
        console.log('✅ Constraint UNIQUE agregado a reference');
      } catch (error) {
        if (error.original?.code === '42P07') {
          // El constraint ya existe
          console.log('⚠️ Constraint UNIQUE ya existe en reference');
        } else {
          console.log('⚠️ Error al agregar constraint UNIQUE:', error.message);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('OrderDetails');
    
    if (tableInfo.reference) {
      // Primero eliminar el constraint si existe
      try {
        await queryInterface.removeConstraint('OrderDetails', 'orderdetails_reference_unique');
        console.log('✅ Constraint UNIQUE eliminado');
      } catch (error) {
        console.log('⚠️ No se pudo eliminar constraint UNIQUE (puede que no exista)');
      }
      
      // Luego eliminar la columna
      await queryInterface.removeColumn('OrderDetails', 'reference');
      console.log('❌ Campo reference eliminado de OrderDetails');
    }
  }
};
