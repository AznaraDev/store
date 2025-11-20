const { Category, SubCategory, Product } = require("../../data");
const response = require("../../utils/response");

/**
 * Eliminar una categoría (soft delete)
 * DELETE /category/:id
 * 
 * Validaciones:
 * - No permite eliminar si hay subcategorías asociadas
 * - No permite eliminar si hay productos asociados
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Intentando eliminar categoría:', id);

    // Verificar que la categoría existe
    const category = await Category.findByPk(id);
    if (!category) {
      console.log('❌ Categoría no encontrada:', id);
      return response(res, 404, { error: "Categoría no encontrada" });
    }
    console.log('✅ Categoría encontrada:', category.name_category);

    // Verificar si hay subcategorías asociadas
    const subCategoriesCount = await SubCategory.count({
      where: { id_category: id }
    });
    console.log('📊 Subcategorías asociadas:', subCategoriesCount);

    if (subCategoriesCount > 0) {
      console.log('⚠️ No se puede eliminar - tiene subcategorías');
      return response(res, 400, { 
        error: `No se puede eliminar la categoría "${category.name_category}" porque tiene ${subCategoriesCount} subcategoría(s) asociada(s)`,
        subCategoriesCount 
      });
    }

    // Verificar si hay productos asociados
    const productsCount = await Product.count({
      where: { id_category: id }
    });
    console.log('📦 Productos asociados:', productsCount);

    if (productsCount > 0) {
      console.log('⚠️ No se puede eliminar - tiene productos');
      return response(res, 400, { 
        error: `No se puede eliminar la categoría "${category.name_category}" porque tiene ${productsCount} producto(s) asociado(s)`,
        productsCount 
      });
    }

    // Eliminar (soft delete por paranoid: true)
    await category.destroy();
    console.log('✅ Categoría eliminada exitosamente:', category.name_category);

    return response(res, 200, {
      message: `Categoría "${category.name_category}" eliminada exitosamente`
    });

  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
    return response(res, 500, { error: error.message });
  }
};
