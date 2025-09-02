const { Bill, OrderDetail, Product, Image, User, Buyer, Payment } = require('../../data');
const { Op } = require('sequelize');
const response = require('../../utils/response');

// Función auxiliar para formatear fechas (puedes moverla a utils)
const formatForLogs = (date) => {
  return new Date(date).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatForDisplay = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getColombiaTime = () => {
  return new Date();
};

// 🧾 GENERAR BILL DESDE ORDERDETAIL
const generateBill = async (req, res, next) => {
  try {
    console.log("🧾 [GENERATE-BILL] Iniciando generación de factura");
    console.log("🕐 [GENERATE-BILL] Hora Colombia:", formatForLogs(getColombiaTime()));
    console.log("📥 [GENERATE-BILL] Parámetros:", {
      orderDetailId: req.params.orderDetailId,
      user: req.user ? req.user.n_document : "No user",
    });

    const { orderDetailId } = req.params;

    // ⭐ VALIDACIONES BÁSICAS
    if (!orderDetailId) {
      console.log("❌ [GENERATE-BILL] orderDetailId faltante");
      return response(res, 400, {
        error: "orderDetailId es requerido",
        timestamp: formatForLogs(getColombiaTime()),
      });
    }

    console.log("🔍 [GENERATE-BILL] Verificando factura existente...");

    // ⭐ VERIFICAR SI YA EXISTE UNA FACTURA PARA ESTA ORDEN
    const existingBill = await Bill.findOne({
      where: { orderDetailId: orderDetailId },
    });

    if (existingBill) {
      console.log("⚠️ [GENERATE-BILL] Ya existe una factura para esta orden:", existingBill.idBill);

      const enrichedBill = {
        ...existingBill.toJSON(),
        createdAtFormatted: formatForLogs(existingBill.createdAt),
        updatedAtFormatted: formatForLogs(existingBill.updatedAt),
        totalAmountFormatted: `$${parseFloat(existingBill.totalAmount || 0).toLocaleString()}`,
        statusLabel: existingBill.status === "paid" ? "Pagada" : 
                     existingBill.status === "pending" ? "Pendiente" : "Cancelada",
      };

      return res.status(200).json({
        success: true,
        data: {
          bill: enrichedBill,
          message: "Factura ya existe para esta orden",
          timestamp: formatForLogs(getColombiaTime()),
        }
      });
    }

    console.log("✅ [GENERATE-BILL] No hay factura existente, procediendo...");

    // ⭐ OBTENER DATOS COMPLETOS DE LA ORDEN
    console.log("🔍 [GENERATE-BILL] Obteniendo datos de la orden...");

    const orderDetail = await OrderDetail.findByPk(orderDetailId, {
      include: [
        {
          model: Product,
          as: "products",
          include: [
            {
              model: Image,
              as: 'Images',  // ✅ Corregido alias
              attributes: ['url'],
              limit: 1
            }
          ]
        },
        {
          model: User,
          attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']  // ✅ Primera corrección
        },
       
       {
      model: Payment,
      as: "payments",
      attributes: ['id_payment', 'payment_state', 'createdAt', 'updatedAt'],
      where: { payment_state: 'Pago' }, // Usando tu ENUM
      required: false,
    },
      ],
    });

    if (!orderDetail) {
      console.log("❌ [GENERATE-BILL] Orden no encontrada:", orderDetailId);
      return response(res, 404, {
        error: "Orden no encontrada",
        timestamp: formatForLogs(getColombiaTime()),
      });
    }

    console.log("✅ [GENERATE-BILL] Orden encontrada:", {
      orderDetailId: orderDetail.id_orderDetail,
      customerDocument: orderDetail.n_document,
      customerName: orderDetail.User ? 
        `${orderDetail.User.first_name || ''} ${orderDetail.User.last_name || ''}`.trim() || "N/A" : "N/A",  // ✅ Corregido
      status: orderDetail.state_order,
      amount: orderDetail.amount,
      quantity: orderDetail.quantity,
      hasProducts: orderDetail.products?.length > 0,
    });

    // ⭐ VERIFICAR QUE LA ORDEN ESTÉ EN ESTADO ADECUADO
    if (!["completed", "shipped", "delivered"].includes(orderDetail.state_order)) {
      console.log("❌ [GENERATE-BILL] Estado de orden inválido:", orderDetail.state_order);
      return response(res, 400, {
        error: "La orden debe estar en estado 'completed', 'shipped' o 'delivered' para generar factura",
        data: {
          currentStatus: orderDetail.state_order,
          validStatuses: ["completed", "shipped", "delivered"],
        },
        timestamp: formatForLogs(getColombiaTime()),
      });
    }

    // ⭐ CALCULAR TOTALES
    console.log("💰 [GENERATE-BILL] Calculando totales...");

    const orderAmount = parseFloat(orderDetail.amount) || 0;
    const quantity = parseInt(orderDetail.quantity) || 1;
    
    // Para productos físicos, el total podría ser amount * quantity
    // O si amount ya incluye la cantidad, usar solo amount
    const subtotalAmount = orderAmount; // Ajustar según tu lógica de negocio
    
    // Calcular IVA (19% en Colombia)
    const taxRate = 0.19;
    const taxAmount = subtotalAmount * taxRate;
    const netAmount = subtotalAmount - taxAmount; // Monto sin IVA
    const totalAmount = subtotalAmount; // Total con IVA incluido

    console.log("💰 [GENERATE-BILL] Cálculo de totales:", {
      orderAmount,
      quantity,
      subtotalAmount,
      netAmount,
      taxAmount,
      totalAmount,
      taxRate: `${taxRate * 100}%`,
    });

    // ⭐ VERIFICAR QUE EL MONTO TOTAL SEA VÁLIDO
    if (totalAmount <= 0) {
      console.log("❌ [GENERATE-BILL] Monto total inválido:", totalAmount);
      return response(res, 400, {
        error: "El monto total de la factura debe ser mayor a cero",
        data: { orderAmount, totalAmount },
        timestamp: formatForLogs(getColombiaTime()),
      });
    }

    // ⭐ DETERMINAR MÉTODO DE PAGO DESDE PAGOS EXISTENTES (WOMPI)
    const payments = orderDetail.payments || [];
    const primaryPaymentMethod = "wompi"; // Todos los pagos son con Wompi

    // ⭐ CALCULAR TOTAL PAGADO
    const totalPaid = payments.reduce((sum, payment) => {
      // Si el estado es 'Pago', asumir que está pagado completo
      return payment.payment_state === 'Pago' ? orderAmount : 0;
    }, 0);

    console.log("💳 [GENERATE-BILL] Información de pagos:", {
      paymentsCount: payments.length,
      primaryPaymentMethod,
      totalPaid,
      totalAmount,
      isFullyPaid: totalPaid >= totalAmount,
      paymentsDetails: payments.map(p => ({
        id: p.id_payment,
        state: p.payment_state,
        date: formatForLogs(p.createdAt)
      }))
    });

    console.log("💳 [GENERATE-BILL] Método de pago principal:", primaryPaymentMethod);

    // ⭐ CREAR LA FACTURA
    const billData = {
      orderDetailId: orderDetail.id_orderDetail,
      customerDocument: orderDetail.n_document,
      subtotalAmount: subtotalAmount,
      taxAmount: taxAmount,
      netAmount: netAmount,
      totalAmount: totalAmount,
      status: totalPaid >= totalAmount ? "paid" : "pending", // Estado basado en pagos
      paymentMethod: primaryPaymentMethod, // Wompi
      invoiceReference: `ORD-${orderDetail.id_orderDetail}`,
      description: `Venta de productos - Orden ${orderDetail.id_orderDetail}`,
    };

    console.log("📝 [GENERATE-BILL] Datos de factura a crear:");
    console.log(JSON.stringify(billData, null, 2));

    // ⭐ CREAR REGISTRO EN LA BASE DE DATOS
    console.log("💾 [GENERATE-BILL] Creando factura en base de datos...");

    let savedBill = null;
    try {
      savedBill = await Bill.create(billData);
      console.log("✅ [GENERATE-BILL] Factura guardada en BD:", {
        idBill: savedBill.idBill,
        totalAmount: savedBill.totalAmount,
        status: savedBill.status,
      });
    } catch (billError) {
      console.error("❌ [GENERATE-BILL] Error al guardar factura:", billError.message);
      return response(res, 500, {
        error: "Error al crear la factura en la base de datos",
        details: billError.message,
        timestamp: formatForLogs(getColombiaTime()),
      });
    }

    // ⭐ CREAR RESPUESTA ENRIQUECIDA
    console.log("📤 [GENERATE-BILL] Preparando respuesta enriquecida...");

    const responseData = {
      ...savedBill.toJSON(),

      // ⭐ INFORMACIÓN DEL CLIENTE
      customerInfo: {
        name: orderDetail.User ? 
          `${orderDetail.User.first_name || ''} ${orderDetail.User.last_name || ''}`.trim() || "Cliente" : "Cliente",  // ✅ Corregido
        document: orderDetail.n_document,
        email: orderDetail.User?.email || null,
        phone: orderDetail.User?.phone || null,
      },

      // ⭐ INFORMACIÓN DE LA ORDEN
      orderInfo: {
        orderDetailId: orderDetail.id_orderDetail,
        date: formatForLogs(orderDetail.date),
        dateFormatted: formatForDisplay(orderDetail.date),
        quantity: orderDetail.quantity,
        state: orderDetail.state_order,
        address: orderDetail.address,
        deliveryAddress: orderDetail.deliveryAddress,
      },

      // ⭐ INFORMACIÓN DE PRODUCTOS
      productsInfo: {
        products: orderDetail.products?.map(product => ({
          id: product.id_product,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.images?.[0]?.url || null,
          priceFormatted: `$${parseFloat(product.price || 0).toLocaleString()}`,
        })) || [],
        productsCount: orderDetail.products?.length || 0,
      },

      // ⭐ FECHAS FORMATEADAS
      createdAtFormatted: formatForLogs(savedBill.createdAt),
      createdAtDisplay: formatForDisplay(savedBill.createdAt),
      totalAmountFormatted: `$${totalAmount.toLocaleString()}`,
      subtotalAmountFormatted: `$${subtotalAmount.toLocaleString()}`,
      taxAmountFormatted: `$${taxAmount.toLocaleString()}`,
      netAmountFormatted: `$${netAmount.toLocaleString()}`,

      // ⭐ INFORMACIÓN DE ESTADO
      statusInfo: {
        status: savedBill.status,
        statusLabel: savedBill.status === "paid" ? "Pagada" : 
                     savedBill.status === "pending" ? "Pendiente" : "Cancelada",
        isPaid: savedBill.status === "paid",
        isPending: savedBill.status === "pending",
      },

      // ⭐ ACCIONES DISPONIBLES
      availableActions: {
        canSendToTaxxa: savedBill.status === "paid" && !savedBill.taxInvoiceId,
        canGenerateTaxInvoice: savedBill.status === "paid",
        canCancelBill: savedBill.status === "pending",
        canDownloadPdf: true,
        canEmailToCustomer: !!orderDetail.User?.email,
      },

      // ⭐ METADATOS
      metadata: {
        generatedAt: formatForLogs(getColombiaTime()),
        generatedBy: req.user?.n_document || "system",
        timezone: "America/Bogota",
        currency: "COP",
        hasTaxes: taxAmount > 0,
        taxRate: `${taxRate * 100}%`,
      },
    };

    console.log("✅ [GENERATE-BILL] Factura generada exitosamente:", {
      idBill: savedBill.idBill,
      orderDetailId: orderDetail.id_orderDetail,
      totalAmount: savedBill.totalAmount,
      status: savedBill.status,
      generatedAt: formatForLogs(getColombiaTime()),
    });

    return res.status(201).json({
      success: true,
      data: {
        bill: responseData,
        message: "Factura generada exitosamente",
        timestamp: formatForLogs(getColombiaTime()),
      }
    });

  } catch (error) {
    console.error("❌ [GENERATE-BILL] Error general:", error);
    console.error("🕐 [GENERATE-BILL] Hora del error:", formatForLogs(getColombiaTime()));

    return response(res, 500, {
      error: "Error interno al generar la factura",
      details: error.message,
      timestamp: formatForLogs(getColombiaTime()),
    });
  }
};

// 🧾 OBTENER TODAS LAS FACTURAS
const getAllBills = async (req, res, next) => {
  try {
    console.log("🧾 [GET-ALL-BILLS] Iniciando consulta de facturas");
    
    const {
      status,
      limit = 50,
      page = 1,
      sortBy = "createdAt",
      sortOrder = "DESC",
      fromDate,
      toDate,
      customerDocument,
      includeDetails = "true",
    } = req.query;

    // ⭐ CONSTRUIR FILTROS
    const whereConditions = {};
    if (status) whereConditions.status = status;
    if (fromDate || toDate) {
      whereConditions.createdAt = {};
      if (fromDate) whereConditions.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) whereConditions.createdAt[Op.lte] = new Date(toDate);
    }
    if (customerDocument) whereConditions.customerDocument = customerDocument;

    // ⭐ CONSULTAR FACTURAS
    const { count, rows: bills } = await Bill.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: OrderDetail,
          as: "orderDetail",
          include: [
            {
              model: User,
              attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']  // ✅ Segunda corrección
            },
            {
              model: Product,
              as: "products",
              include: [
                {
                  model: Image,
                  as: 'Images',  // ✅ Usar el alias correcto con mayúscula
                  attributes: ['url'],
                  limit: 1
                }
              ]
            },
            {
              model: Payment,
              as: "payments",
              attributes: ['id_payment', 'payment_state', 'createdAt', 'updatedAt'],
              required: false,
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    if (!bills || bills.length === 0) {
      return response(res, 200, {
        bills: [],
        pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 },
        summary: { totalBills: 0, byStatus: {}, totalRevenue: 0 },
        timestamp: formatForLogs(getColombiaTime()),
      });
    }

    // ⭐ PROCESAR DATOS
    const billsWithDetails = bills.map((bill) => {
      const billData = bill.toJSON();
      const totalAmount = parseFloat(billData.totalAmount || 0);

      return {
        ...billData,
        createdAtFormatted: formatForLogs(billData.createdAt),
        customerName: billData.orderDetail?.User ? 
          `${billData.orderDetail.User.first_name || ''} ${billData.orderDetail.User.last_name || ''}`.trim() || "N/A" : "N/A",  // ✅ Corregido
        customerEmail: billData.orderDetail?.User?.email || "N/A",
        orderDate: billData.orderDetail?.date ? formatForLogs(billData.orderDetail.date) : null,
        productsCount: billData.orderDetail?.products?.length || 0,
        totalAmountFormatted: `$${totalAmount.toLocaleString()}`,
        statusLabel: billData.status === "paid" ? "Pagada" : 
                     billData.status === "pending" ? "Pendiente" : "Cancelada",
        isPaid: billData.status === "paid",
        hasTaxInvoice: !!billData.taxInvoiceId,
      };
    });

    // ⭐ CREAR RESUMEN
    const summary = {
      totalBills: count,
      billsByStatus: {
        paid: billsWithDetails.filter((b) => b.isPaid).length,
        pending: billsWithDetails.filter((b) => b.status === "pending").length,
        cancelled: billsWithDetails.filter((b) => b.status === "cancelled").length,
      },
      financialSummary: {
        totalRevenue: billsWithDetails
          .filter((b) => b.isPaid)
          .reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0),
        totalPending: billsWithDetails
          .filter((b) => b.status === "pending")
          .reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0),
      },
    };

    // ✅ RESPUESTA EXITOSA - Usar misma estructura que otros controladores de Taxxa
    return res.status(200).json({
      success: true,
      data: {
        bills: includeDetails === "true" ? billsWithDetails : billsWithDetails.map((bill) => ({
          idBill: bill.idBill,
          orderDetailId: bill.orderDetailId,
          customerName: bill.customerName,
          totalAmountFormatted: bill.totalAmountFormatted,
          statusLabel: bill.statusLabel,
          createdAtFormatted: bill.createdAtFormatted,
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
        summary,
        timestamp: formatForLogs(getColombiaTime()),
      }
    });

  } catch (error) {
    console.error("❌ [GET-ALL-BILLS] Error:", error);
    return response(res, 500, {
      error: "Error interno al obtener las facturas",
      details: error.message,
      timestamp: formatForLogs(getColombiaTime()),
    });
  }
};

// 🧾 OBTENER FACTURA POR ID
const getBillById = async (req, res, next) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findByPk(billId, {
      include: [
        {
          model: OrderDetail,
          as: "orderDetail",
          include: [
            {
              model: User,
              attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']  // ✅ Tercera corrección
            },
            {
              model: Product,
              as: "products",
              include: [
                {
                  model: Image,
                  as: 'Images',  // ✅ Corregido alias
                  attributes: ['url']
                }
              ]
            },
            {
              model: Payment,
              as: "payments",
              attributes: ['id_payment', 'payment_state', 'createdAt', 'updatedAt'],
              required: false,
            }
          ]
        }
      ]
    });

    if (!bill) {
      return response(res, 404, { error: "Factura no encontrada" });
    }

    const enrichedBill = {
      ...bill.toJSON(),
      createdAtFormatted: formatForLogs(bill.createdAt),
      totalAmountFormatted: `$${parseFloat(bill.totalAmount || 0).toLocaleString()}`,
      statusLabel: bill.status === "paid" ? "Pagada" : 
                   bill.status === "pending" ? "Pendiente" : "Cancelada",
    };

    return res.status(200).json({
      success: true,
      data: {
        bill: enrichedBill,
        message: "Factura obtenida exitosamente"
      }
    });

  } catch (error) {
    console.error("❌ [GET-BILL-BY-ID] Error:", error);
    return response(res, 500, {
      error: "Error al obtener la factura",
      details: error.message
    });
  }
};



module.exports = {
  generateBill,
  getAllBills,
  getBillById,
};