const { User, OrderDetail } = require("../../data");
const { Sequelize } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    console.log("Fetching customers with purchases...");
    
    // Obtener usuarios que tienen al menos una orden
    const customers = await User.findAll({
      attributes: [
        'n_document',
        'first_name',
        'last_name',
        'gender',
        'email',
        'phone',
        'city',
        'createdAt',
        [Sequelize.fn('COUNT', Sequelize.col('OrderDetails.id_orderDetail')), 'totalOrders'],
        [Sequelize.fn('SUM', Sequelize.col('OrderDetails.amount')), 'totalSpent']
      ],
      include: [
        {
          model: OrderDetail,
          as: 'OrderDetails',
          attributes: [],
          required: true // INNER JOIN - solo usuarios con órdenes
        }
      ],
      group: ['User.n_document'],
      order: [[Sequelize.literal('"totalSpent"'), 'DESC']], // Ordenar por gasto total
      raw: false
    });

    // Formatear los resultados
    const formattedCustomers = customers.map(customer => ({
      n_document: customer.n_document,
      first_name: customer.first_name,
      last_name: customer.last_name,
      full_name: `${customer.first_name} ${customer.last_name}`,
      gender: customer.gender,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      createdAt: customer.createdAt,
      totalOrders: parseInt(customer.getDataValue('totalOrders')) || 0,
      totalSpent: parseFloat(customer.getDataValue('totalSpent')) || 0
    }));

    console.log(`Found ${formattedCustomers.length} customers with purchases`);
    
    return response(res, 200, { 
      customers: formattedCustomers,
      count: formattedCustomers.length 
    });
    
  } catch (error) {
    console.error("Error al obtener los clientes: ", error);
    return response(res, 500, { error: error.message });
  }
};
