const { Product, Image, Category, SubCategory, Material } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el producto por su ID y obtener los detalles del mismo
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Image,
          as: 'Images'  // ✅ Agregado alias requerido
        },
        {
          model: Category,
          attributes: ['id_category', 'name_category'],
        },
        {
          model: SubCategory,
          attributes: ['id_SB', 'name_SB'],
        },
        {
          model: Material,
          as: 'materials',
          attributes: ['id_material', 'name', 'description'],
          through: { attributes: [] } // No incluir campos de la tabla intermedia
        },
      ],
    });

    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    // El modelo Product ya tiene getters que parsean automáticamente sizes, colors y materials
    const parsedProduct = product.toJSON();

    // Obtener productos relacionados de dos tipos:
    // 1. Variantes del mismo producto (mismo nombre) - para mostrar colores/talles
    // 2. Productos de la misma categoría (diferente nombre) - para "similar products"
    const relatedProducts = await Product.findAll({
      where: {
        id_category: product.id_category, // Misma categoría
      },
      include: [
        {
          model: Image,
          as: 'Images'  // ✅ Agregado alias requerido
        },
        {
          model: Category,
          attributes: ['id_category', 'name_category'],
        },
        {
          model: SubCategory,
          attributes: ['id_SB', 'name_SB'],
        },
        {
          model: Material,
          as: 'materials',
          attributes: ['id_material', 'name', 'description'],
          through: { attributes: [] }
        },
      ],
    });

    // El modelo Product ya tiene getters que parsean automáticamente
    const parsedRelatedProducts = relatedProducts.map(relProd => relProd.toJSON());

    return response(res, 200, {
      product: parsedProduct,
      relatedProducts: parsedRelatedProducts, // Enviar el producto principal y los productos relacionados
    });
  } catch (error) {
    console.error('Error fetching product and related products:', error);
    return response(res, 500, { error: error.message });
  }
};
