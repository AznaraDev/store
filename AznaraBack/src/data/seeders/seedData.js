const { Category, SubCategory, Product, Image } = require('../index');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // Limpiar datos existentes en orden correcto (de dependiente a independiente)
    console.log('🧹 Limpiando datos existentes...');
    await Image.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    await SubCategory.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    console.log('✅ Datos existentes eliminados');

    // Crear Categorías fijas por sección
    // Caballero: Relojes, Manillas, Anillos, Cadenas
    // Dama: Relojes, Manillas, Anillos, Cadenas, Aretes
    const categories = await Promise.all([
      Category.create({ name_category: 'Relojes' }),
      Category.create({ name_category: 'Manillas' }),
      Category.create({ name_category: 'Anillos' }),
      Category.create({ name_category: 'Cadenas' }),
      Category.create({ name_category: 'Aretes' }), // Solo para Dama
    ]);
    console.log('✅ Categorías creadas:', categories.length);

    // Crear Subcategorías
    const subcategories = await Promise.all([
      // Relojes (categories[0])
      SubCategory.create({ name_SB: 'Deportivos', id_category: categories[0].id_category }),
      SubCategory.create({ name_SB: 'Elegantes', id_category: categories[0].id_category }),
      SubCategory.create({ name_SB: 'Casuales', id_category: categories[0].id_category }),
      SubCategory.create({ name_SB: 'Inteligentes', id_category: categories[0].id_category }),
      
      // Manillas (categories[1])
      SubCategory.create({ name_SB: 'Eslabones', id_category: categories[1].id_category }),
      SubCategory.create({ name_SB: 'Rígidas', id_category: categories[1].id_category }),
      SubCategory.create({ name_SB: 'Charm', id_category: categories[1].id_category }),
      SubCategory.create({ name_SB: 'Tenis', id_category: categories[1].id_category }),
      
      // Anillos (categories[2])
      SubCategory.create({ name_SB: 'Compromiso', id_category: categories[2].id_category }),
      SubCategory.create({ name_SB: 'Matrimonio', id_category: categories[2].id_category }),
      SubCategory.create({ name_SB: 'Solitarios', id_category: categories[2].id_category }),
      SubCategory.create({ name_SB: 'Casuales', id_category: categories[2].id_category }),
      
      // Cadenas (categories[3])
      SubCategory.create({ name_SB: 'Cadenas Gruesas', id_category: categories[3].id_category }),
      SubCategory.create({ name_SB: 'Cadenas Delgadas', id_category: categories[3].id_category }),
      SubCategory.create({ name_SB: 'Con Dije', id_category: categories[3].id_category }),
      SubCategory.create({ name_SB: 'Gargantillas', id_category: categories[3].id_category }),
      
      // Aretes (categories[4]) - Solo Dama
      SubCategory.create({ name_SB: 'Largos', id_category: categories[4].id_category }),
      SubCategory.create({ name_SB: 'Studs', id_category: categories[4].id_category }),
      SubCategory.create({ name_SB: 'Argollas', id_category: categories[4].id_category }),
      SubCategory.create({ name_SB: 'Colgantes', id_category: categories[4].id_category }),
    ]);
    console.log('✅ Subcategorías creadas:', subcategories.length);

    // Crear Productos de prueba
    const products = [
      // === RELOJES (categories[0]) ===
      // Relojes Dama
      {
        name: 'Reloj Elegante Dama',
        description: 'Reloj elegante con correa de cuero y detalles en oro rosa',
        price: 1200000,
        stock: 8,
        min_stock: 3,
        max_stock: 15,
        id_category: categories[0].id_category,
        id_SB: subcategories[1].id_SB, // Elegantes
        section: 'Dama',
        sizes: ['Ajustable'],
        colors: ['Oro Rosa'],
        materials: ['Acero', 'Cuero'],
        isOffer: false
      },
      {
        name: 'Reloj Deportivo Dama',
        description: 'Reloj deportivo resistente al agua con monitor de actividad',
        price: 750000,
        stock: 12,
        min_stock: 5,
        max_stock: 20,
        id_category: categories[0].id_category,
        id_SB: subcategories[0].id_SB, // Deportivos
        section: 'Dama',
        sizes: ['Ajustable'],
        colors: ['Negro'],
        materials: ['Silicona', 'Acero'],
        isOffer: true
      },
      // Relojes Caballero
      {
        name: 'Reloj Deportivo Steel',
        description: 'Reloj deportivo resistente al agua en acero inoxidable',
        price: 850000,
        stock: 10,
        min_stock: 3,
        max_stock: 15,
        id_category: categories[0].id_category,
        id_SB: subcategories[0].id_SB, // Deportivos
        section: 'Caballero',
        sizes: ['Ajustable'],
        colors: ['Plateado'],
        materials: ['Acero Inoxidable'],
        isOffer: false
      },
      {
        name: 'Reloj Elegante Clásico',
        description: 'Reloj elegante con correa de cuero genuino',
        price: 1500000,
        stock: 7,
        min_stock: 2,
        max_stock: 10,
        id_category: categories[0].id_category,
        id_SB: subcategories[1].id_SB, // Elegantes
        section: 'Caballero',
        sizes: ['Ajustable'],
        colors: ['Negro'],
        materials: ['Acero', 'Cuero Genuino'],
        isOffer: false
      },

      // === MANILLAS (categories[1]) ===
      // Manillas Dama
      {
        name: 'Manilla Charm Personalizada',
        description: 'Manilla charm con dijes intercambiables en plata',
        price: 320000,
        stock: 15,
        min_stock: 5,
        max_stock: 30,
        id_category: categories[1].id_category,
        id_SB: subcategories[6].id_SB, // Charm
        section: 'Dama',
        sizes: ['17cm', '19cm', '21cm'],
        colors: ['Plata'],
        materials: ['Plata 925'],
        isOffer: false
      },
      {
        name: 'Manilla Rígida Oro',
        description: 'Manilla rígida con diseño minimalista en oro de 14k',
        price: 680000,
        stock: 8,
        min_stock: 3,
        max_stock: 15,
        id_category: categories[1].id_category,
        id_SB: subcategories[5].id_SB, // Rígidas
        section: 'Dama',
        sizes: ['S', 'M', 'L'],
        colors: ['Oro Amarillo'],
        materials: ['Oro 14k'],
        isOffer: false
      },
      // Manillas Caballero
      {
        name: 'Manilla Eslabones Gruesa',
        description: 'Manilla de eslabones gruesos en plata 925',
        price: 450000,
        stock: 12,
        min_stock: 4,
        max_stock: 20,
        id_category: categories[1].id_category,
        id_SB: subcategories[4].id_SB, // Eslabones
        section: 'Caballero',
        sizes: ['19cm', '21cm', '23cm'],
        colors: ['Plata'],
        materials: ['Plata 925'],
        isOffer: false
      },

      // === ANILLOS (categories[2]) ===
      // Anillos Dama
      {
        name: 'Anillo Solitario Compromiso',
        description: 'Elegante anillo de compromiso con diamante solitario en oro blanco de 18k',
        price: 2500000,
        stock: 5,
        min_stock: 2,
        max_stock: 10,
        id_category: categories[2].id_category,
        id_SB: subcategories[8].id_SB, // Compromiso
        section: 'Dama',
        sizes: ['5', '6', '7', '8'],
        colors: ['Oro Blanco'],
        materials: ['Oro 18k', 'Diamante'],
        isOffer: false
      },
      {
        name: 'Anillo Casual Flores',
        description: 'Anillo casual con diseño de flores en plata 925',
        price: 180000,
        stock: 15,
        min_stock: 5,
        max_stock: 30,
        id_category: categories[2].id_category,
        id_SB: subcategories[11].id_SB, // Casuales
        section: 'Dama',
        sizes: ['5', '6', '7', '8', '9'],
        colors: ['Plata'],
        materials: ['Plata 925'],
        isOffer: true
      },
      // Anillos Caballero
      {
        name: 'Anillo Matrimonio Oro',
        description: 'Anillo de matrimonio clásico en oro de 18k',
        price: 980000,
        stock: 8,
        min_stock: 3,
        max_stock: 12,
        id_category: categories[2].id_category,
        id_SB: subcategories[9].id_SB, // Matrimonio
        section: 'Caballero',
        sizes: ['8', '9', '10', '11', '12'],
        colors: ['Oro Amarillo'],
        materials: ['Oro 18k'],
        isOffer: false
      },

      // === CADENAS (categories[3]) ===
      // Cadenas Dama
      {
        name: 'Cadena Delgada con Dije Corazón',
        description: 'Delicada cadena con dije de corazón en oro de 14k',
        price: 450000,
        stock: 10,
        min_stock: 3,
        max_stock: 20,
        id_category: categories[3].id_category,
        id_SB: subcategories[14].id_SB, // Con Dije
        section: 'Dama',
        sizes: ['40cm', '45cm'],
        colors: ['Oro Amarillo'],
        materials: ['Oro 14k'],
        isOffer: false
      },
      {
        name: 'Gargantilla Circonitas',
        description: 'Gargantilla con circonitas brillantes en plata',
        price: 220000,
        stock: 18,
        min_stock: 5,
        max_stock: 30,
        id_category: categories[3].id_category,
        id_SB: subcategories[15].id_SB, // Gargantillas
        section: 'Dama',
        sizes: ['35cm', '38cm'],
        colors: ['Plata'],
        materials: ['Plata 925', 'Circonitas'],
        isOffer: false
      },
      // Cadenas Caballero
      {
        name: 'Cadena Gruesa Eslabones',
        description: 'Cadena gruesa de eslabones en plata 925',
        price: 550000,
        stock: 14,
        min_stock: 5,
        max_stock: 25,
        id_category: categories[3].id_category,
        id_SB: subcategories[12].id_SB, // Cadenas Gruesas
        section: 'Caballero',
        sizes: ['50cm', '55cm', '60cm'],
        colors: ['Plata'],
        materials: ['Plata 925'],
        isOffer: false
      },
      // Cadenas Unisex
      {
        name: 'Cadena Clásica Delgada',
        description: 'Cadena clásica delgada en plata 925',
        price: 280000,
        stock: 20,
        min_stock: 8,
        max_stock: 40,
        id_category: categories[3].id_category,
        id_SB: subcategories[13].id_SB, // Cadenas Delgadas
        section: 'Unisex',
        sizes: ['45cm', '50cm', '55cm'],
        colors: ['Plata'],
        materials: ['Plata 925'],
        isOffer: false
      },

      // === ARETES (categories[4]) - Solo Dama ===
      {
        name: 'Aretes Largos Perla',
        description: 'Elegantes aretes largos con perlas cultivadas',
        price: 280000,
        stock: 12,
        min_stock: 4,
        max_stock: 20,
        id_category: categories[4].id_category,
        id_SB: subcategories[16].id_SB, // Largos
        section: 'Dama',
        sizes: ['Único'],
        colors: ['Plata'],
        materials: ['Plata 925', 'Perla'],
        isOffer: true
      },
      {
        name: 'Studs Diamante',
        description: 'Aretes tipo stud con diamantes en oro blanco',
        price: 1200000,
        stock: 6,
        min_stock: 2,
        max_stock: 8,
        id_category: categories[4].id_category,
        id_SB: subcategories[17].id_SB, // Studs
        section: 'Dama',
        sizes: ['Único'],
        colors: ['Oro Blanco'],
        materials: ['Oro 18k', 'Diamante'],
        isOffer: false
      },
      {
        name: 'Argollas Medianas',
        description: 'Argollas medianas en plata con acabado brillante',
        price: 150000,
        stock: 20,
        min_stock: 8,
        max_stock: 35,
        id_category: categories[4].id_category,
        id_SB: subcategories[18].id_SB, // Argollas
        section: 'Dama',
        sizes: ['2cm', '3cm', '4cm'],
        colors: ['Plata'],
        materials: ['Plata 925'],
        isOffer: false
      },
    ];

    const createdProducts = await Promise.all(
      products.map(productData => Product.create(productData))
    );
    console.log('✅ Productos creados:', createdProducts.length);

    console.log('\n📊 Resumen:');
    console.log(`- Categorías: ${categories.length}`);
    console.log(`- Subcategorías: ${subcategories.length}`);
    console.log(`- Productos: ${createdProducts.length}`);
    console.log('\n🎉 Seed completado exitosamente!');

    return {
      categories,
      subcategories,
      products: createdProducts
    };

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
};

module.exports = seedData;

// Si se ejecuta directamente
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
