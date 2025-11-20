const { Material } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

module.exports = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const whereClause = {};

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: materials } = await Material.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    return response(res, 200, {
      materials,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    return response(res, 500, { error: error.message });
  }
};
