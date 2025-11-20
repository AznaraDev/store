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

    // Obtener los productos que tengan el mismo id_SB, id_category, y section
    // (permitiendo precios diferentes para variantes)
    const relatedProducts = await Product.findAll({
      where: {
        id_SB: product.id_SB, // Comparar con el id_SB del producto principal
        id_category: product.id_category, // Comparar con el id_category del producto principal
        section: product.section, // Comparar con la section del producto principal
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
