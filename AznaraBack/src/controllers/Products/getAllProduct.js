const { Product, Image, Category, SubCategory } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    const { search, price, categoryId, categoryName, subCategoryName } = req.query;

    let whereClause = {
      [Op.and]: [],
    };

    // Filtro por nombre y/o precio de Product
    if (search) {
      whereClause[Op.and].push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { price: { [Op.eq]: price } },
        ],
      });
    }

    // Filtro por id_category de Category
    if (categoryId) {
      whereClause[Op.and].push({
        '$Category.id_category$': categoryId,
      });
    }

    // Filtro por name_category de Category
    if (categoryName) {
      whereClause[Op.and].push({
        '$Category.name_category$': { [Op.iLike]: `%${categoryName}%` },
      });
    }

     if (subCategoryName) {
      whereClause[Op.and].push({
        '$SubCategory.name_SB$': { [Op.iLike]: `%${subCategoryName}%` }, // Asegúrate que el alias y nombre de columna sean correctos
      });
    }


      // Construir la consulta de productos
    const products = await Product.findAll({
      where: whereClause,
      include: [
        { model: Image, as: 'Images' },  // ✅ Agregado alias requerido
        {
          model: Category,
          attributes: ['id_category', 'name_category'],
        },
        { //  AÑADIR ESTO PARA INCLUIR SUBCATEGORÍA
          model: SubCategory,
          attributes: ['id_SB', 'name_SB'], // O los atributos que necesites
          // required: false // Usa false si un producto puede no tener subcategoría y aun así quieres que aparezca
                           // Si usas true (o lo omites, que es el default para include directo),
                           // solo traerá productos que TENGAN una subcategoría.
                           // Si también filtras por subCategoryName, 'required: true' podría ser implícito o deseado.
        },
      ],
    });

    response(res, 200, {
      products: products,
    });
  } catch (error) {
    console.error('Error fetching all products:', error); // Añadir un log más específico
    response(res, 500, { error: error.message });
  }
};



