const { Material } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return response(res, 400, { error: 'El nombre del material es obligatorio' });
    }

    // Verificar si ya existe un material con ese nombre
    const existingMaterial = await Material.findOne({
      where: { name: name.trim() }
    });

    if (existingMaterial) {
      return response(res, 400, { error: 'Ya existe un material con ese nombre' });
    }

    const material = await Material.create({
      name: name.trim(),
      description: description?.trim() || null
    });

    return response(res, 201, { material });
  } catch (error) {
    console.error('Error al crear material:', error);
    return response(res, 500, { error: error.message });
  }
};
