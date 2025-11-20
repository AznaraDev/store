const { Product, Image, Category, SubCategory, Material, sequelize } = require('../../data');
const response = require('../../utils/response');
const { Op, fn, col } = require('sequelize');

module.exports = async (req, res) => {
  try {
    const {
      section,
      categoryId,
      subCategoryId,
      search,
      stockStatus, // 'all', 'low', 'out', 'normal'
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    // Filtro por sección
    if (section && section !== 'all') {
      whereClause.section = section;
    }

    // Filtro por categoría
    if (categoryId) {
      whereClause.id_category = categoryId;
    }

    // Filtro por subcategoría
    if (subCategoryId) {
      whereClause.id_SB = subCategoryId;
    }

    // Filtro por búsqueda
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    // Filtro por estado de stock
    if (stockStatus) {
      switch (stockStatus) {
        case 'out':
          whereClause.stock = 0;
          break;
        case 'low':
          whereClause.stock = {
            [Op.and]: [
              { [Op.gt]: 0 },
              { [Op.lte]: col('min_stock') }
            ]
          };
          break;
        case 'normal':
          whereClause.stock = {
            [Op.gt]: col('min_stock')
          };
          break;
        // 'all' no agrega filtro
      }
    }

    const offset = (page - 1) * limit;
    const validSortFields = ['createdAt', 'name', 'price', 'stock', 'updatedAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Obtener productos con paginación
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Image,
          as: 'Images',
          limit: 1, // Solo la primera imagen para dashboard
          attributes: ['id_image', 'url']
        },
        {
          model: Category,
          attributes: ['id_category', 'name_category'],
        },
        {
          model: SubCategory,
          attributes: ['id_SB', 'name_SB'],
        },
        {
          model: Material,
          as: 'materials',
          attributes: ['id_material', 'name', 'description'],
          through: { attributes: [] } // No incluir campos de la tabla intermedia
        }
      ],
      attributes: [
        'id_product',
        'name',
        'description',
        'price',
        'stock',
        'min_stock',
        'max_stock',
        'section',
        'isOffer',
        'sizes',
        'colors',
        'createdAt',
        'updatedAt'
      ],
      order: [[orderField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // El modelo Product ya tiene getters que parsean automáticamente
    const parsedProducts = products.map(product => product.toJSON());

    // Calcular estadísticas generales usando sequelize.literal para CASE statements
    const stats = await Product.findAll({
      attributes: [
        [fn('COUNT', col('id_product')), 'total'],
        [fn('SUM', col('stock')), 'total_stock'],
        [sequelize.literal(`COUNT(CASE WHEN stock = 0 THEN 1 END)`), 'out_of_stock'],
        [sequelize.literal(`COUNT(CASE WHEN stock > 0 AND stock <= min_stock THEN 1 END)`), 'low_stock']
      ],
      raw: true
    });

    // Estadísticas por sección
    const statsBySection = await Product.findAll({
      attributes: [
        'section',
        [fn('COUNT', col('id_product')), 'count'],
        [fn('SUM', col('stock')), 'total_stock']
      ],
      group: ['section'],
      raw: true
    });

    return response(res, 200, {
      products: parsedProducts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      stats: {
        general: stats[0] || {},
        bySection: statsBySection
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard products:', error);
    return response(res, 500, { error: error.message });
  }
};
