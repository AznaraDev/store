const { Product, Image} = require('../../data');
const response = require('../../utils/response');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id,{
      include:{
        model: Image,
      }
    });

    if (!product) {
      return response(res, 404, { error: "Product not found" });
    }

    return response(res, 200, { product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return response(res, 500, { error: error.message });
  }
};
