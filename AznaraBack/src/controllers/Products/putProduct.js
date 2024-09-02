const { Product } = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  if (!name && !description && !price && !stock) {
    return response(res, 400, { error: "No data to update" });
  }

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    // Actualizar los campos del producto
    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;

    // Guardar los cambios en la base de datos
    await product.save();
    console.log('Product updated:', product);

    return response(res, 200, { message: "Product updated successfully", product });
  } catch (error) {
    console.error('Error updating product:', error);
    return response(res, 500, { error: error.message });
  }
};

