const { Category } = require('../../data');
const response = require('../../utils/response');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  try {
    const { name_category } = req.body;

    if (!name_category) {
      return response(res, 400, { error: "nombre requerido" });
    }

        let standardizedName = name_category.trim();
    if (standardizedName) {
      // 1. Primera letra mayúscula, resto minúsculas
      standardizedName = standardizedName.charAt(0).toUpperCase() + standardizedName.slice(1).toLowerCase();
      
      // 2. Lógica de pluralización (simplificada - ajustar según necesidad)
      // Evitar pluralizar si ya parece ser plural o es una palabra específica que no sigue la regla simple.
      const endsWithS = standardizedName.endsWith('s');
      const endsWithEs = standardizedName.endsWith('es');
      // Podrías añadir excepciones aquí, ej: ['Relojes', 'Aretes'] si ya vienen bien.
      const exceptions = ['Relojes', 'Aretes']; // Palabras que ya están en plural o son excepciones

      if (!endsWithS && !endsWithEs && !exceptions.includes(standardizedName)) {
        if (standardizedName.endsWith('z')) {
            standardizedName = standardizedName.slice(0, -1) + 'ces'; // Ej: Pez -> Peces, Luz -> Luces
        } else if (['a', 'e', 'i', 'o', 'u'].includes(standardizedName.slice(-1).toLowerCase())) {
            standardizedName += 's'; // Vocal -> añade s (Ej: Anillo -> Anillos)
        } else if (standardizedName.length > 2) { // Evitar añadir 'es' a palabras muy cortas sin vocal al final
            standardizedName += 'es'; // Consonante -> añade es (Ej: Manilla -> Manillas - OJO: esto es una simplificación)
        }
      }
    } else {
        // Si después de trim() el nombre está vacío, mantener el error original.
        return response(res, 400, { error: "nombre requerido" });
    }
    
     const existingCategory = await Category.findOne({ where: { name_category } });

     if (existingCategory) {
       return response(res, 400, { error: "Ya existe esta categoría" });
     }
 

     const categoryData = {
      id_category: uuidv4(), 
      name_category: standardizedName // Usar el nombre estandarizado
    };

    const category = await Category.create(categoryData);

    console.log('Categoría creada:', category);
    return response(res, 201, { category });
  } catch (error) {
    console.error('Error :', error);
    return response(res, 500, { error: error.message });
  }
};

