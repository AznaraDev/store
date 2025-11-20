const { Material } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);

    if (!material) {
      return response(res, 404, { error: 'Material no encontrado' });
    }

    await material.destroy();

    return response(res, 200, { message: 'Material eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    return response(res, 500, { error: error.message });
  }
};
