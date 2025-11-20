const { Product, StockMovement, Image, Category, SubCategory } = require("../../data");
const response = require("../../utils/response");

/**
 * Obtener productos con información de stock y movimientos
 * GET /stock/products
 * 
 * Query params:
 * - page: Número de página (default: 1)
 * - limit: Items por página (default: 20)
 * - search: Búsqueda por nombre de producto
 * - lowStock: Solo productos con stock bajo (true/false)
 */
module.exports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      lowStock = false 
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where.name = {
        [require('sequelize').Op.iLike]: `%${search}%`
      };
    }

    // Obtener productos con sus movimientos de stock
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Image,
          as: 'Images',
          attributes: ['id_image', 'url'],
          limit: 1
        },
        {
          model: Category,
          attributes: ['id_category', 'name_category']
        },
        {
          model: SubCategory,
          attributes: ['id_SB', 'name_SB']
        },
        {
          model: StockMovement,
          as: 'stockMovements',
          attributes: ['id_movement', 'movement_type', 'quantity', 'previous_stock', 'new_stock', 'reason', 'createdAt'],
          limit: 10, // Últimos 10 movimientos
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['name', 'ASC']]
    });

    // Filtrar por stock bajo si se solicita
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(p => p.stock < 10);
    }

    // Formatear respuesta
    const formattedProducts = filteredProducts.map(product => ({
      id_product: product.id_product,
      name: product.name,
      stock: product.stock,
      price: product.price,
      image: product.Images?.[0]?.url || null,
      category: product.Category?.name_category || null,
      subCategory: product.SubCategory?.name_SB || null,
      stockStatus: product.stock < 5 ? 'critical' : product.stock < 10 ? 'low' : 'normal',
      recentMovements: product.stockMovements?.map(movement => ({
        id: movement.id_movement,
        type: movement.movement_type,
        quantity: movement.quantity,
        previousStock: movement.previous_stock,
        newStock: movement.new_stock,
        reason: movement.reason,
        date: movement.createdAt
      })) || []
    }));

    return response(res, 200, {
      products: formattedProducts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error("Error al obtener productos con stock:", error);
    return response(res, 500, { error: error.message });
  }
};
