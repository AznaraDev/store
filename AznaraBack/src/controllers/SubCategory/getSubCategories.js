const { SubCategory, Category } = require("../../data");
const response = require("../../utils/response");

/**
 * Obtener todas las subcategorías
 * GET /category/subcategory
 * 
 * Query params opcionales:
 * - categoryId: Filtrar por categoría
 */
module.exports = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const subCategories = await SubCategory.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id_category', 'name', 'section']
        }
      ],
      order: [['name', 'ASC']]
    });

    return response(res, 200, {
      subCategories,
      count: subCategories.length
    });

  } catch (error) {
    console.error("Error al obtener subcategorías:", error);
    return response(res, 500, { error: error.message });
  }
};
