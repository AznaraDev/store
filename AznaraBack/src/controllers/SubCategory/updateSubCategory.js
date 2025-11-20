const { SubCategory } = require("../../data");
const response = require("../../utils/response");

/**
 * Actualizar una subcategoría
 * PUT /category/subcategory/:id
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    if (!name) {
      return response(res, 400, { error: "El nombre es requerido" });
    }

    // Verificar que la subcategoría existe
    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return response(res, 404, { error: "Subcategoría no encontrada" });
    }

    // Verificar que el nuevo nombre no esté duplicado en la misma categoría
    const targetCategoryId = categoryId || subCategory.id_category;
    
    if (name !== subCategory.name_SB || categoryId) {
      const existingSubCategory = await SubCategory.findOne({
        where: { 
          name_SB: name,
          id_category: targetCategoryId
        }
      });

      if (existingSubCategory && existingSubCategory.id_SB !== id) {
        return response(res, 400, { 
          error: `Ya existe una subcategoría con el nombre "${name}" en esta categoría` 
        });
      }
    }

    // Actualizar
    await subCategory.update({
      name_SB: name,
      id_category: categoryId || subCategory.id_category
    });

    return response(res, 200, {
      message: "Subcategoría actualizada exitosamente",
      subCategory
    });

  } catch (error) {
    console.error("Error al actualizar subcategoría:", error);
    return response(res, 500, { error: error.message });
  }
};
