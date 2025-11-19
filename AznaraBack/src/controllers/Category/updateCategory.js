const { Category, Product } = require("../../data");
const response = require("../../utils/response");

/**
 * Actualizar una categoría
 * PUT /category/:id
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, section } = req.body;

    if (!name) {
      return response(res, 400, { error: "El nombre es requerido" });
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(id);
    if (!category) {
      return response(res, 404, { error: "Categoría no encontrada" });
    }

    // Verificar que el nuevo nombre no esté duplicado (si cambió)
    if (name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name }
      });

      if (existingCategory) {
        return response(res, 400, { 
          error: `Ya existe una categoría con el nombre "${name}"` 
        });
      }
    }

    // Actualizar
    await category.update({
      name,
      section: section || category.section
    });

    return response(res, 200, {
      message: "Categoría actualizada exitosamente",
      category
    });

  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return response(res, 500, { error: error.message });
  }
};
