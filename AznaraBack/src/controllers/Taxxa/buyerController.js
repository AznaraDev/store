const { Buyer, User } = require('../../data'); 

const response = require('../../utils/response');
const { Op } = require('sequelize'); // Agregar para las consultas de búsqueda

const mapDocumentType = (docTypeInput) => {
  // Si ya es numérico, validar que esté en el rango correcto
  if (typeof docTypeInput === 'number') {
    const validTypes = [11, 12, 13, 21, 22, 31, 41, 42, 47, 48, 50, 91];
    return validTypes.includes(docTypeInput) ? docTypeInput : 13; // Default CC
  }
  
  // Mapear desde texto a número
  const textToNumber = {
    'RC': 11,   'TI': 12,   'CC': 13,   'TE': 21,   'CE': 22,
    'NIT': 31,  'PAS': 41,  'DEX': 42,  'PEP': 47,  'PPT': 48,
    'FI': 50,   'NUIP': 91
  };
  
  const upperInput = String(docTypeInput).toUpperCase();
  return textToNumber[upperInput] || 13; // Default CC
};

// FUNCIÓN AUXILIAR PARA VALIDAR DATOS (adaptada para n_document)
const validateBuyerData = (buyerData) => {
  const errors = [];
  
  if (!buyerData.n_document && !buyerData.sdocno) {
    errors.push('El número de documento (n_document) es requerido');
  }
  
  if (!buyerData.scostumername || buyerData.scostumername.length < 2) {
    errors.push('El nombre del cliente debe tener al menos 2 caracteres');
  }
  
  if (!buyerData.selectronicmail || !/\S+@\S+\.\S+/.test(buyerData.selectronicmail)) {
    errors.push('Debe proporcionar un email válido');
  }
  
  if (!buyerData.stelephone || buyerData.stelephone.length < 7) {
    errors.push('El teléfono debe tener al menos 7 dígitos');
  }
  
  return errors;
};

// 🆕 FUNCIÓN PARA VERIFICAR/OBTENER BUYER EXISTENTE O DATOS DE USER
const checkOrCreateBuyer = async (req, res, next) => {
  try {
    const { n_document } = req.params || req.body;
    
    console.log('🔍 [BUYER] Verificando comprador para documento:', n_document);
    
    if (!n_document) {
      return response(res, 400, {
        error: 'El número de documento (n_document) es requerido'
      });
    }

    // 1. Verificar si ya existe el Buyer
    const existingBuyer = await Buyer.findOne({ 
      where: { n_document },
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email', 'phone']  // ✅ Primera corrección
      }]
    });
    
    if (existingBuyer) {
      console.log('✅ [BUYER] Comprador existente encontrado:', existingBuyer.scostumername);
      return response(res, 200, {
        buyer: {
          ...existingBuyer.toJSON(),
          wdoctype: existingBuyer.wdoctype
        },
        exists: true,
        message: 'Comprador encontrado'
      });
    }

    // 2. Si no existe Buyer, buscar datos del User para pre-llenar
    const user = await User.findByPk(n_document);
    if (!user) {
      return response(res, 404, {
        error: 'Usuario no encontrado'
      });
    }

    console.log('📋 [BUYER] Usuario encontrado, puede crear Buyer:', user.name);
    
    // 3. Retornar datos del User para pre-llenar formulario
    return response(res, 200, {
      buyer: null,
      exists: false,
      userData: {
        n_document: user.n_document,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      message: 'Usuario encontrado, puede crear perfil de facturación'
    });

  } catch (error) {
    console.error('❌ [BUYER] Error en checkOrCreateBuyer:', error);
    next(error);
  }
};

// Crea un nuevo Buyer (adaptado para n_document)
const createBuyer = async (req, res, next) => {
  try {
    console.log('📝 [BUYER] Creando nuevo comprador:', JSON.stringify(req.body, null, 2));
    
    const buyerData = req.body;
    
    // Extraer los campos que no queremos enviar (los anidados)
    const { jpartylegalentity, jcontact, n_document, ...rest } = buyerData;
    
    // Verificar que tenemos n_document
    const documentNumber = n_document || buyerData.sdocno;
    if (!documentNumber) {
      return response(res, 400, {
        error: 'El número de documento (n_document) es requerido'
      });
    }

    // Verificar que el User existe
    const user = await User.findByPk(documentNumber);
    if (!user) {
      return response(res, 404, {
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si ya existe un Buyer para este usuario
    const existingBuyer = await Buyer.findOne({ where: { n_document: documentNumber } });
    if (existingBuyer) {
      console.log('⚠️ [BUYER] Comprador ya existe:', documentNumber);
      return response(res, 409, {
        error: 'El comprador ya se encuentra registrado',
        data: {
          ...existingBuyer.toJSON(),
          wdoctype: existingBuyer.wdoctype
        }
      });
    }
    
    // Formar el objeto aplanado con mapeo de campos
    const flattenedBuyerData = {
      ...rest,
      n_document: documentNumber, // FK hacia User
      sdocno: documentNumber, // Mapeo para Taxxa API
      wdoctype: mapDocumentType(buyerData.wdoctype || (jpartylegalentity && jpartylegalentity.wdoctype)),
      scorporateregistrationschemename:
        buyerData.scorporateregistrationschemename ||
        (jpartylegalentity && jpartylegalentity.scorporateregistrationschemename) ||
        'DIAN',
      scontactperson: buyerData.scontactperson || (jcontact && jcontact.scontactperson) || user.name,
      selectronicmail: buyerData.selectronicmail || (jcontact && jcontact.selectronicmail) || user.email,
      stelephone: buyerData.stelephone || (jcontact && jcontact.stelephone) || user.phone,
    };

    console.log('🔧 [BUYER] Datos procesados:', flattenedBuyerData);
    
    // Validar datos
    const validationErrors = validateBuyerData(flattenedBuyerData);
    if (validationErrors.length > 0) {
      return response(res, 400, {
        error: 'Errores de validación',
        details: validationErrors
      });
    }
    
    const newBuyer = await Buyer.create(flattenedBuyerData);
    console.log('✅ [BUYER] Comprador creado exitosamente:', newBuyer.n_document);
    
    return response(res, 201, {
      buyer: {
        ...newBuyer.toJSON(),
        wdoctype: newBuyer.wdoctype
      },
      message: 'Buyer registrado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [BUYER] Error creando comprador:', error);
    
    // Manejo específico de errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return response(res, 400, {
        error: 'Error de validación',
        details: error.errors.map(e => e.message)
      });
    }
    
    next(error);
  }
};

// Obtener Buyer por n_document (adaptado)
const getBuyerByDocument = async (req, res, next) => {
  try {
    const { n_document } = req.params;
    console.log('🔍 [BUYER] Buscando comprador con documento:', n_document);

    if (!n_document) {
      console.log('❌ [BUYER] Documento no proporcionado');
      return response(res, 400, {
        error: 'Número de documento (n_document) no proporcionado'
      });
    }

    const buyer = await Buyer.findOne({ 
      where: { n_document },
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email', 'phone']  // ✅ Segunda corrección
      }]
    });
    
    console.log('📋 [BUYER] Resultado de búsqueda:', buyer ? 'Encontrado' : 'No encontrado');

    if (!buyer) {
      console.log('❌ [BUYER] Comprador no encontrado para documento:', n_document);
      return response(res, 404, {
        error: 'Comprador no encontrado'
      });
    }

    console.log('✅ [BUYER] Comprador encontrado:', buyer.scostumername);
    return response(res, 200, {
      buyer: {
        ...buyer.toJSON(),
        wdoctype: buyer.wdoctype
      },
      message: 'Comprador encontrado'
    });
  } catch (error) {
    console.error('❌ [BUYER] Error en getBuyerByDocument:', error);
    next(error);
  }
};

// OBTENER TODOS LOS COMPRADORES CON PAGINACIÓN (mejorado)
const getAllBuyers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', docType = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { scostumername: { [Op.iLike]: `%${search}%` } },
        { n_document: { [Op.iLike]: `%${search}%` } },
        { selectronicmail: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (docType) {
      whereClause.wdoctype = mapDocumentType(docType);
    }
    
    const { count, rows } = await Buyer.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email', 'phone']  // ✅ Tercera corrección
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    const buyersWithDocText = rows.map(buyer => ({
      ...buyer.toJSON(),
      wdoctype: buyer.wdoctype
    }));
    
    return response(res, 200, {
      buyers: buyersWithDocText,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      message: 'Compradores obtenidos exitosamente'
    });
  } catch (error) {
    console.error('❌ [BUYER] Error obteniendo compradores:', error);
    next(error);
  }
};

// ACTUALIZAR COMPRADOR (adaptado para n_document)
const updateBuyer = async (req, res, next) => {
  try {
    const { n_document } = req.params;
    const updateData = req.body;
    
    console.log('📝 [BUYER] Actualizando comprador:', n_document);
    
    // Mapear tipo de documento si viene en la actualización
    if (updateData.wdoctype) {
      updateData.wdoctype = mapDocumentType(updateData.wdoctype);
    }
    
    // Remover campos que no se deben actualizar
    delete updateData.n_document;
    delete updateData.sdocno;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const [rowsUpdated] = await Buyer.update(updateData, {
      where: { n_document }
    });
    
    if (rowsUpdated === 0) {
      return response(res, 404, {
        error: 'Comprador no encontrado'
      });
    }
    
    const updatedBuyer = await Buyer.findOne({ 
      where: { n_document },
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email', 'phone']  // ✅ Cuarta corrección
      }]
    });
    
    console.log('✅ [BUYER] Comprador actualizado exitosamente');
    
    return response(res, 200, {
      buyer: {
        ...updatedBuyer.toJSON(),
        wdoctype: updatedBuyer.wdoctype
      },
      message: 'Comprador actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ [BUYER] Error actualizando comprador:', error);
    next(error);
  }
};

module.exports = {
  checkOrCreateBuyer, // 🆕 Función principal para el flujo de checkout
  createBuyer,
  getBuyerByDocument,
  getAllBuyers,
  updateBuyer,
  mapDocumentType // Para uso en otros módulos
};