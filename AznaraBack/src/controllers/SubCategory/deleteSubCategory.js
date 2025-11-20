const { SubCategory, Product } = require("../../data");
const response = require("../../utils/response");

/**
 * Eliminar una subcategoría (soft delete)
 * DELETE /category/subcategory/:id
 * 
 * Validaciones:
 * - No permite eliminar si hay productos asociados
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la subcategoría existe
    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return response(res, 404, { error: "Subcategoría no encontrada" });
    }

    // Verificar si hay productos asociados
    const productsCount = await Product.count({
      where: { id_SB: id }
    });

    if (productsCount > 0) {
      return response(res, 400, { 
        error: `No se puede eliminar la subcategoría "${subCategory.name_SB}" porque tiene ${productsCount} producto(s) asociado(s)`,
        productsCount 
      });
    }

    // Eliminar (soft delete por paranoid: true)
    await subCategory.destroy();

    return response(res, 200, {
      message: `Subcategoría "${subCategory.name_SB}" eliminada exitosamente`
    });

  } catch (error) {
    console.error("Error al eliminar subcategoría:", error);
    return response(res, 500, { error: error.message });
  }
};
