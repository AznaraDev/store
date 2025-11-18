const { Product } = require('../data');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script para migrar productos con múltiples colores a un producto por color
 * 
 * FORMATO ANTIGUO: 
 * - Un producto con colors: ["Dorado", "Plateado", "Negro"]
 * - Múltiples imágenes asociadas
 * 
 * FORMATO NUEVO:
 * - Tres productos separados, cada uno con su color específico
 * - Producto 1: colors: ["Dorado"]
 * - Producto 2: colors: ["Plateado"]
 * - Producto 3: colors: ["Negro"]
 */

async function migrateProducts() {
  try {
    console.log('🔍 Buscando productos con múltiples colores...\n');

    // 1. Obtener todos los productos
    const products = await Product.findAll({
      where: {
        deletedAt: null
      }
    });

    console.log(`📦 Total de productos encontrados: ${products.length}\n`);

    // 2. Filtrar productos que tienen más de un color
    const productsToMigrate = [];
    const backupData = [];

    for (const product of products) {
      const colors = product.colors || [];
      
      if (colors.length > 1) {
        productsToMigrate.push(product);
        
        // Guardar backup del producto original
        backupData.push({
          id_product: product.id_product,
          name: product.name,
          description: product.description,
          price: product.price,
          colors: product.colors,
          sizes: product.sizes,
          materials: product.materials,
          images: product.images,
          stock: product.stock,
          section: product.section,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          isOffer: product.isOffer,
          stock_control: product.stock_control,
          createdAt: product.createdAt
        });
      }
    }

    console.log(`⚠️  Productos con múltiples colores: ${productsToMigrate.length}\n`);

    if (productsToMigrate.length === 0) {
      console.log('✅ No hay productos para migrar. Todos tienen un solo color.');
      return;
    }

    // 3. Crear archivo de backup
    const backupPath = path.join(__dirname, '../../backups');
    await fs.mkdir(backupPath, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(backupPath, `products_backup_${timestamp}.json`);
    
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup creado: ${backupFile}\n`);

    // 4. Mostrar plan de migración
    console.log('📋 PLAN DE MIGRACIÓN:\n');
    console.log('─'.repeat(80));
    
    for (const product of productsToMigrate) {
      console.log(`\n🏷️  ${product.name}`);
      console.log(`   ID Original: ${product.id_product}`);
      console.log(`   Colores actuales: ${product.colors.join(', ')}`);
      console.log(`   Se crearán ${product.colors.length} productos nuevos:`);
      
      product.colors.forEach((color, index) => {
        console.log(`      ${index + 1}. ${product.name} - ${color}`);
      });
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n⚠️  IMPORTANTE: Este script solo muestra el plan de migración.');
    console.log('⚠️  Para ejecutar la migración, descomenta la sección de ejecución.\n');

    // 5. EJECUTAR MIGRACIÓN (Descomenta para ejecutar)
    /*
    console.log('\n🚀 INICIANDO MIGRACIÓN...\n');
    
    let totalCreated = 0;
    const migrationLog = [];

    for (const product of productsToMigrate) {
      const colors = product.colors;
      const images = product.images || [];
      
      // Dividir imágenes entre los colores (distribuir equitativamente)
      const imagesPerColor = Math.ceil(images.length / colors.length);
      
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const startIdx = i * imagesPerColor;
        const colorImages = images.slice(startIdx, startIdx + imagesPerColor);
        
        // Crear nuevo producto para este color
        const newProduct = await Product.create({
          name: product.name,
          description: product.description,
          price: product.price,
          colors: [color], // Solo UN color
          sizes: product.sizes,
          materials: product.materials,
          images: colorImages.length > 0 ? colorImages : [images[0]], // Al menos una imagen
          stock: Math.floor(product.stock / colors.length), // Dividir stock
          section: product.section,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          isOffer: product.isOffer,
          stock_control: product.stock_control,
          min_stock: product.min_stock,
          max_stock: product.max_stock,
          tax_classification: product.tax_classification,
          tax_included: product.tax_included,
          tax_consumption_value: product.tax_consumption_value
        });

        totalCreated++;
        
        migrationLog.push({
          original_id: product.id_product,
          original_name: product.name,
          new_id: newProduct.id_product,
          new_name: newProduct.name,
          color: color,
          images: colorImages
        });

        console.log(`   ✅ Creado: ${newProduct.name} - ${color} (${colorImages.length} imágenes)`);
      }

      // Marcar el producto original como eliminado (soft delete)
      await product.destroy();
      console.log(`   🗑️  Producto original marcado como eliminado\n`);
    }

    // Guardar log de migración
    const migrationLogFile = path.join(backupPath, `migration_log_${timestamp}.json`);
    await fs.writeFile(migrationLogFile, JSON.stringify(migrationLog, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log(`✅ MIGRACIÓN COMPLETADA`);
    console.log(`📊 Productos originales: ${productsToMigrate.length}`);
    console.log(`📦 Productos nuevos creados: ${totalCreated}`);
    console.log(`💾 Backup: ${backupFile}`);
    console.log(`📝 Log: ${migrationLogFile}`);
    console.log('='.repeat(80) + '\n');
    */

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Función auxiliar para descargar productos desde producción
async function downloadProductsFromProduction(productionUrl, authToken) {
  try {
    console.log('🌐 Descargando productos desde producción...\n');
    
    const response = await axios.get(`${productionUrl}/product/all`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    const products = response.data.products || response.data;
    
    // Guardar productos descargados
    const backupPath = path.join(__dirname, '../../backups');
    await fs.mkdir(backupPath, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const downloadFile = path.join(backupPath, `production_products_${timestamp}.json`);
    
    await fs.writeFile(downloadFile, JSON.stringify(products, null, 2));
    
    console.log(`✅ ${products.length} productos descargados`);
    console.log(`💾 Guardado en: ${downloadFile}\n`);
    
    return products;
  } catch (error) {
    console.error('❌ Error descargando productos:', error.message);
    throw error;
  }
}

// Función para analizar productos descargados
async function analyzeDownloadedProducts(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(data);
    
    console.log('\n📊 ANÁLISIS DE PRODUCTOS:\n');
    console.log('─'.repeat(80));
    
    let multiColorCount = 0;
    let singleColorCount = 0;
    let noColorCount = 0;
    
    const multiColorProducts = [];
    
    products.forEach(product => {
      const colors = product.colors || [];
      
      if (colors.length > 1) {
        multiColorCount++;
        multiColorProducts.push({
          id: product.id_product,
          name: product.name,
          colors: colors,
          colorCount: colors.length,
          images: product.images?.length || 0
        });
      } else if (colors.length === 1) {
        singleColorCount++;
      } else {
        noColorCount++;
      }
    });
    
    console.log(`Total de productos: ${products.length}`);
    console.log(`Con múltiples colores: ${multiColorCount}`);
    console.log(`Con un solo color: ${singleColorCount}`);
    console.log(`Sin color: ${noColorCount}\n`);
    
    if (multiColorProducts.length > 0) {
      console.log('📋 PRODUCTOS CON MÚLTIPLES COLORES:\n');
      multiColorProducts.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`);
        console.log(`   Colores (${p.colorCount}): ${p.colors.join(', ')}`);
        console.log(`   Imágenes: ${p.images}\n`);
      });
    }
    
    console.log('─'.repeat(80) + '\n');
    
    return { products, multiColorProducts };
  } catch (error) {
    console.error('❌ Error analizando archivo:', error.message);
    throw error;
  }
}

// Exportar funciones
module.exports = {
  migrateProducts,
  downloadProductsFromProduction,
  analyzeDownloadedProducts
};

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateProducts()
    .then(() => {
      console.log('✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}
