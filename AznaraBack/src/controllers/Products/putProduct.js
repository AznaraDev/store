const { Product, Image, Material } = require('../../data'); // Added Material model
const response = require('../../utils/response');
const multer = require('multer'); // Added multer
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Added
const cloudinary = require('../../utils/cloudinaryConfig'); // Added

// Configuración de Cloudinary Storage para nuevas imágenes
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products', // Misma carpeta que en createProduct
    transformation: [
      { width: 300, height: 300, fit: 'scale' }
    ],
    format: async (req, file) => 'png', // o el formato que prefieras
    public_id: (req, file) => `product_${req.params.id}_${Date.now()}_${file.originalname.split('.')[0]}`,
  },
});

const upload = multer({ storage: storage });

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/');
    const folderAndFileNameWithVersion = parts.slice(parts.indexOf('upload') + 2).join('/');
    // Remove version if present (e.g., v1234567890/)
    const folderAndFileName = folderAndFileNameWithVersion.replace(/v\d+\//, '');
    const publicIdWithExtension = folderAndFileName;
    return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
  } catch (error) {
    console.error("Error extracting public_id from URL:", url, error);
    return null;
  }
};


module.exports = async (req, res) => {
  // Usar upload.array() para manejar tanto campos de texto como archivos
  // 'newImages' será el nombre del campo en el FormData para las nuevas imágenes
  upload.array('newImages', 5)(req, res, async function (err) { // Permite hasta 5 nuevas imágenes
    if (err instanceof multer.MulterError) {
      console.error('Multer error during product update:', err);
      return response(res, 400, { error: 'Error uploading new files.' });
    } else if (err) {
      console.error('Unknown error during product update file processing:', err);
      return response(res, 400, { error: err.message });
    }

    const { id } = req.params;
    const {
      name, description, price, stock, section, name_SB, sizes, colors, materials, materialIds, isOffer,
      imagesToDelete, id_category, id_SB 
    } = req.body;

    console.log('📝 Datos recibidos en updateProduct:');
    console.log('   materialIds:', materialIds);
    console.log('   materials (legacy):', materials);

    const newImageFiles = req.files; // Nuevas imágenes subidas

    // Validar si hay algo que actualizar
    if (
      name === undefined && description === undefined && price === undefined && stock === undefined &&
      section === undefined && name_SB === undefined && sizes === undefined && colors === undefined &&
      materials === undefined && isOffer === undefined &&
      (!newImageFiles || newImageFiles.length === 0) &&
      (!imagesToDelete || JSON.parse(imagesToDelete || "[]").length === 0)
    ) {
      return response(res, 400, { error: "No data to update" });
    }

    try {
      const product = await Product.findByPk(id);

      if (!product) {
        // Si el producto no se encuentra, y se intentaron subir imágenes, eliminarlas de Cloudinary
        if (newImageFiles && newImageFiles.length > 0) {
          for (const file of newImageFiles) {
            const publicId = getPublicIdFromUrl(file.path);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          }
        }
        return response(res, 404, { error: "Product not found" });
      }

      // Actualizar los campos del producto
      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = parseFloat(price);
      if (stock !== undefined) product.stock = parseInt(stock, 10);
      if (isOffer !== undefined) product.isOffer = isOffer === 'true' || isOffer === true;
      if (section !== undefined) product.section = section;
      if (name_SB !== undefined) product.name_SB = name_SB;
      if (id_category !== undefined) product.id_category = id_category; 
      if (id_SB !== undefined) product.id_SB = id_SB;                   
      
      // Para arrays/JSON: siempre parsear si es string, el setter del modelo hará el stringify
      if (sizes !== undefined) {
        try {
          product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        } catch (e) {
          // Si JSON.parse falla, asumir que ya es un array
          product.sizes = sizes;
        }
      }
      if (colors !== undefined) {
        try {
          product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
        } catch (e) {
          product.colors = colors;
        }
      }
      if (materials !== undefined) {
        try {
          product.materials = typeof materials === 'string' ? JSON.parse(materials) : materials;
        } catch (e) {
          product.materials = materials;
        }
      }

      // 1. Eliminar imágenes marcadas para borrado
      if (imagesToDelete) {
        const parsedImagesToDelete = JSON.parse(imagesToDelete || "[]");
        if (Array.isArray(parsedImagesToDelete) && parsedImagesToDelete.length > 0) {
          for (const imageId of parsedImagesToDelete) {
            const imageRecord = await Image.findOne({ where: { id_image: imageId, id_product: product.id_product } });
            if (imageRecord) {
              const publicId = getPublicIdFromUrl(imageRecord.url);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                console.log(`Deleted image from Cloudinary: ${publicId}`);
              }
              await imageRecord.destroy();
              console.log(`Deleted image from DB: ${imageId}`);
            }
          }
        }
      }

      // 2. Añadir nuevas imágenes
      if (newImageFiles && newImageFiles.length > 0) {
        const imagePromises = newImageFiles.map(file =>
          Image.create({
            id_product: product.id_product,
            url: file.path, // URL de Cloudinary
          })
        );
        await Promise.all(imagePromises);
        console.log(`Added ${newImageFiles.length} new images to product ${product.id_product}`);
      }

      // Actualizar materiales si se proporcionaron
      if (materialIds) {
        const materialIdsArray = JSON.parse(materialIds);
        console.log('✅ Actualizando materiales:', materialIdsArray);
        
        if (materialIdsArray.length > 0) {
          const materialsToAssociate = await Material.findAll({
            where: { id_material: materialIdsArray }
          });
          console.log('✅ Materiales encontrados:', materialsToAssociate.length);
          await product.setMaterials(materialsToAssociate);
          console.log('✅ Materiales actualizados');
        } else {
          // Si el array está vacío, eliminar todas las asociaciones
          await product.setMaterials([]);
          console.log('✅ Materiales eliminados (array vacío)');
        }
      }

      // Obtener el producto actualizado con sus imágenes y materiales
      const updatedProductWithImages = await Product.findByPk(product.id_product, {
        include: [
          { model: Image, as: 'Images' },
          { model: Material, as: 'materials', attributes: ['id_material', 'name', 'description'] }
        _product);

      // Obtener el producto actualizado con sus imágenes
      const updatedProductWithImages = await Product.findByPk(product.id_product, {
        include: [{ model: Image, as: 'Images' }]
      });

      return response(res, 200, { message: "Product updated successfully", product: updatedProductWithImages });

    } catch (error) {
      console.error('Error updating product:', error);
      // Si hay un error después de subir nuevas imágenes, intentar eliminarlas de Cloudinary
      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          try {
            const publicId = getPublicIdFromUrl(file.path);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          } catch (cleanupError) {
            console.error("Error cleaning up uploaded file from Cloudinary:", cleanupError);
          }
        }
      }
      return response(res, 500, { error: error.message });
    }
  });
};