const { SubCategory, Product } = require("../../data");
const response = require("../../utils/response");

/**
 * Crear una subcategoría
 * POST /category/subcategory
 */
module.exports = async (req, res) => {
  try {
    console.log('📝 [createSubCategory] Body recibido:', req.body);
    const { name, categoryId } = req.body;

    console.log('📝 [createSubCategory] name:', name);
    console.log('📝 [createSubCategory] categoryId:', categoryId);

    if (!name || !categoryId) {
      console.log('❌ [createSubCategory] Faltan campos requeridos');
      return response(res, 400, { 
        error: "Nombre y categoryId son requeridos" 
      });
    }

    // Verificar que no exista una subcategoría con el mismo nombre en la misma categoría
    const existingSubCategory = await SubCategory.findOne({
      where: { 
        name_SB: name,
        id_category: categoryId 
      }
    });

    if (existingSubCategory) {
      console.log('⚠️ [createSubCategory] Subcategoría duplicada encontrada');
      return response(res, 400, { 
        error: `Ya existe una subcategoría con el nombre "${name}" en esta categoría` 
      });
    }

    // Crear la subcategoría
    const newSubCategory = await SubCategory.create({
      name_SB: name,
      id_category: categoryId
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
