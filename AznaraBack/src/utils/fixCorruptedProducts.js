// Script para corregir productos con arrays JSON corruptos (doble stringify)
const { Product } = require('../data');

const fixCorruptedProducts = async () => {
  try {
    console.log('🔍 Buscando productos con datos corruptos...');
    
    const products = await Product.findAll();
    let fixedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      const updates = {};
      
      // Obtener los valores RAW de la base de datos (sin pasar por el getter)
      const rawSizes = product.getDataValue('sizes');
      const rawColors = product.getDataValue('colors');
      const rawMaterials = product.getDataValue('materials');
      
      // Función para detectar y corregir doble stringify
      const fixDoubleStringify = (rawValue, fieldName) => {
        if (!rawValue) return null;
        
        try {
          // Primer parse
          const firstParse = JSON.parse(rawValue);
          
          // Si el primer parse resulta en un array de strings que parecen JSON, hay corrupción
          if (Array.isArray(firstParse) && firstParse.length > 0) {
            // Verificar si el primer elemento es un string que parece JSON
            if (typeof firstParse[0] === 'string' && firstParse[0].trim().startsWith('[')) {
              // Caso especial: ["[\"valor1\"", "\"valor2\"", "\"valor3\"]"]
              // Reconstruir el JSON correcto
              const joinedString = firstParse.join('');
              const secondParse = JSON.parse(joinedString);
              console.log(`  ✅ Corregido ${fieldName}: ${rawValue} → ${JSON.stringify(secondParse)}`);
              return secondParse;
            }
            // Si no hay corrupción, retornar el array parseado normalmente
            return firstParse;
          }
          
          return firstParse;
        } catch (error) {
          console.log(`  ⚠️  Error parseando ${fieldName} de producto ${product.id_product}:`, error.message);
          return null;
        }
      };
      
      // Verificar y corregir sizes
      const fixedSizes = fixDoubleStringify(rawSizes, 'sizes');
      if (fixedSizes && JSON.stringify(fixedSizes) !== rawSizes) {
        updates.sizes = fixedSizes;
        needsUpdate = true;
      }
      
      // Verificar y corregir colors
      const fixedColors = fixDoubleStringify(rawColors, 'colors');
      if (fixedColors && JSON.stringify(fixedColors) !== rawColors) {
        updates.colors = fixedColors;
        needsUpdate = true;
      }
      
      // Verificar y corregir materials
      const fixedMaterials = fixDoubleStringify(rawMaterials, 'materials');
      if (fixedMaterials && JSON.stringify(fixedMaterials) !== rawMaterials) {
        updates.materials = fixedMaterials;
        needsUpdate = true;
      }
      
      // Actualizar si es necesario
      if (needsUpdate) {
        console.log(`📝 Actualizando producto: ${product.name} (${product.id_product})`);
        
        // Actualizar directamente en la BD sin pasar por los setters
        await Product.update(
          {
            sizes: updates.sizes ? JSON.stringify(updates.sizes) : rawSizes,
            colors: updates.colors ? JSON.stringify(updates.colors) : rawColors,
            materials: updates.materials ? JSON.stringify(updates.materials) : rawMaterials
          },
          {
            where: { id_product: product.id_product },
            hooks: false // Evitar que se disparen los hooks de Sequelize
          }
        );
        
        fixedCount++;
      }
    }
    
    console.log(`\n✨ Proceso completado. ${fixedCount} productos corregidos de ${products.length} totales.`);
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const sequelize = require('../data').sequelize;
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Conexión a BD establecida');
      return fixCorruptedProducts();
    })
    .then(() => {
      console.log('👋 Cerrando conexión...');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = fixCorruptedProducts;
