const { Product, Image, Category, SubCategory } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    const { 
      search, 
      price, 
      categoryId, 
      categoryName, 
      subCategoryName,
      section, // Nuevo: filtro por sección
      page = 1, // Paginación
      limit = 20,
      sortBy = 'createdAt', // Ordenamiento
      sortOrder = 'DESC',
      inStock // Nuevo: solo productos con stock
    } = req.query;

    let whereClause = {
      [Op.and]: [],
    };

    // Filtro por búsqueda (nombre)
    if (search) {
      whereClause[Op.and].push({
        name: { [Op.iLike]: `%${search}%` }
      });
    }

    // Filtro por precio
    if (price) {
      whereClause[Op.and].push({
        price: { [Op.eq]: price }
      });
    }

    // Filtro por sección (Dama, Caballero, Unisex)
    if (section) {
      whereClause[Op.and].push({
        section: section
      });
    }

    // Filtro por stock
    if (inStock === 'true') {
      whereClause[Op.and].push({
        stock: { [Op.gt]: 0 }
      });
    }

    // Filtro por id_category
    if (categoryId) {
      whereClause[Op.and].push({
        id_category: categoryId
      });
    }

    // Preparar includes con filtros condicionales
    const includeArray = [
      { model: Image, as: 'Images' }
    ];

    // Filtro por nombre de categoría
    if (categoryName) {
      includeArray.push({
        model: Category,
        attributes: ['id_category', 'name_category'],
        where: {
          name_category: { [Op.iLike]: `%${categoryName}%` }
        },
        required: true // INNER JOIN
      });
    } else {
      includeArray.push({
        model: Category,
        attributes: ['id_category', 'name_category'],
        required: false // LEFT JOIN
      });
    }

    // Filtro por nombre de subcategoría
    if (subCategoryName) {
      includeArray.push({
        model: SubCategory,
        attributes: ['id_SB', 'name_SB'],
        where: {
          name_SB: { [Op.iLike]: `%${subCategoryName}%` }
        },
        required: true // INNER JOIN
      });
    } else {
      includeArray.push({
        model: SubCategory,
        attributes: ['id_SB', 'name_SB'],
        required: false // LEFT JOIN
      });
    }

    // Limpiar array vacío
    if (whereClause[Op.and].length === 0) {
      delete whereClause[Op.and];
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Validar campo de ordenamiento
    const validSortFields = ['createdAt', 'name', 'price', 'stock'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Construir la consulta de productos
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: includeArray,
      order: [[orderField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // El modelo Product ya tiene getters que parsean automáticamente
    const parsedProducts = products.map(product => product.toJSON());

    response(res, 200, {
      products: parsedProducts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    response(res, 500, { error: error.message });
  }
};



