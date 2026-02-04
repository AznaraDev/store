const { Product, Image, StockMovement, Material } = require('../../data');
const response = require('../../utils/response');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../utils/cloudinaryConfig');

// Configuración de Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    transformation: [
      { width: 600, height: 600, crop: 'fill', gravity: 'auto' }
    ],
    format: async (req, file) => 'png',
    public_id: (req, file) => `${Date.now()}_${file.originalname.split('.')[0]}`,
  },
});

const upload = multer({ storage: storage });

module.exports = async (req, res) => {
  upload.array('images')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return response(res, 400, { error: 'Error uploading files.' });
    } else if (err) {
      console.error('Unknown error:', err);
      return response(res, 400, { error: err.message });
    }

    try {
      const {
        name,
        description,
        price,
        stock,
        id_category,
        id_SB,
        sizes,
        colors,
        materialIds, // Array de IDs de materiales
        section,
        isOffer 
      } = req.body;

      console.log('📦 Datos recibidos en createProduct:');
      console.log('   materialIds:', materialIds);
      console.log('   materialIds type:', typeof materialIds);

      if (!name || !description || !price) {
        return response(res, 400, { error: 'Missing required fields' });
      }

      const images = req.files;

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        id_category,
        id_SB,
        sizes: sizes ? JSON.parse(sizes) : null,
        colors: colors ? JSON.parse(colors) : null,
        section,
        isOffer: isOffer === 'true' 
      });

      // Asociar materiales si se proporcionaron
      if (materialIds) {
        const materialIdsArray = JSON.parse(materialIds);
        console.log('✅ materialIdsArray parseado:', materialIdsArray);
        
        if (materialIdsArray.length > 0) {
          const materials = await Material.findAll({
            where: { id_material: materialIdsArray }
          });
          console.log('✅ Materiales encontrados en BD:', materials.length);
          await product.setMaterials(materials);
          console.log('✅ Materiales asociados al producto');
        }
      }

      // Registrar movimiento inicial de stock si hay stock
      if (product.stock > 0) {
        await StockMovement.create({
          id_product: product.id_product,
          movement_type: 'entrada',
          quantity: product.stock,
          previous_stock: 0,
          new_stock: product.stock,
          reason: 'Stock inicial al crear producto',
          performed_by: req.body.performed_by || 'Sistema'
        });
      }

      if (images && images.length > 0) {
        const imagePromises = images.map(async (image) => {
          const createdImage = await Image.create({
            id_product: product.id_product,
            url: image.path,
          });
          return createdImage;
        });

        await Promise.all(imagePromises);
      }

      // Recargar el producto con sus materiales para devolverlo en la respuesta
      const productWithMaterials = await Product.findByPk(product.id_product, {
        include: [
          { model: Material, as: 'materials', attributes: ['id_material', 'name', 'description'] },
          { model: Image, as: 'Images' }
        ]
      });

      console.log('✅ Product with images and materials created:', productWithMaterials.toJSON());
      return response(res, 201, { product: productWithMaterials, images });
    } catch (error) {
      console.error('Error al crear producto con imagen:', error);
      return response(res, 500, { error: error.message });
    }
  });
};



