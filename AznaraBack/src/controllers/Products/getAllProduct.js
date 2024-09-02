const { Product, Image, Category } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    const { search, price, categoryId } = req.query;

    let products;
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

    // Filtro por name_category o id_category de Category
    if (categoryId) {
      whereClause[Op.and].push({
        '$Category.id_category$': categoryId,
      });
    }

    // Construir la consulta de productos
    products = await Product.findAll({
      where: whereClause,
      include: [
        { model: Image },
        {
          model: Category,
          attributes: ['id_category', 'name_category'],
        },
      ],
    });

    response(res, 200, {
      products: products,
    });
  } catch (error) {
    response(res, 500, { error: error.message });
  }
};



