const { SubCategory, Product } = require("../../data");
const response = require("../../utils/response");

/**
 * Crear una subcategoría
 * POST /category/subcategory
 */
module.exports = async (req, res) => {
  try {
    console.log('📝 [createSubCategory] Body recibido:', req.body);
    const { name, categoryId, name_SB, id_category } = req.body;

    // Aceptar ambos formatos de nombres de campo
    const subCategoryName = name || name_SB;
    const categoryIdentifier = categoryId || id_category;

    console.log('📝 [createSubCategory] name:', subCategoryName);
    console.log('📝 [createSubCategory] categoryId:', categoryIdentifier);

    if (!subCategoryName || !categoryIdentifier) {
      console.log('❌ [createSubCategory] Faltan campos requeridos');
      return response(res, 400, { 
        error: "Nombre y categoryId son requeridos" 
      });
    }

    // Verificar que no exista una subcategoría con el mismo nombre en la misma categoría
    const existingSubCategory = await SubCategory.findOne({
      where: { 
        name_SB: subCategoryName,
        id_category: categoryIdentifier 
      }
    });

    if (existingSubCategory) {
      console.log('⚠️ [createSubCategory] Subcategoría duplicada encontrada');
      return response(res, 400, { 
        error: `Ya existe una subcategoría con el nombre "${subCategoryName}" en esta categoría` 
      });
    }

    // Crear la subcategoría
    const newSubCategory = await SubCategory.create({
      name_SB: subCategoryName,
      id_category: categoryIdentifier
    });

    console.log('✅ [createSubCategory] Subcategoría creada:', newSubCategory.toJSON());
    return response(res, 201, {
      message: "Subcategoría creada exitosamente",
      subCategory: newSubCategory
    });

  } catch (error) {
    console.error("❌ [createSubCategory] Error al crear subcategoría:", error);
    return response(res, 500, { error: error.message });
  }
};
