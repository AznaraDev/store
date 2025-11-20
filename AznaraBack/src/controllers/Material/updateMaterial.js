const { Material } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const material = await Material.findByPk(id);

    if (!material) {
      return response(res, 404, { error: 'Material no encontrado' });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (name && name.trim() !== material.name) {
      const existingMaterial = await Material.findOne({
        where: { name: name.trim() }
      });

      if (existingMaterial) {
        return response(res, 400, { error: 'Ya existe un material con ese nombre' });
      }
    }

    await material.update({
      name: name ? name.trim() : material.name,
      description: description !== undefined ? description?.trim() || null : material.description
    });

    return response(res, 200, { material });
  } catch (error) {
    console.error('Error al actualizar material:', error);
    return response(res, 500, { error: error.message });
  }
};
