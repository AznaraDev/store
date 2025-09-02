const { SellerData, User, Buyer, OrderDetail, Product, Image, Bill, Invoice, CreditNote } = require('../../data');
const { generateToken, sendDocument } = require('./taxxaUtils');
const { createInvoiceWithNumber, cancelInvoice, getNextInvoiceNumber } = require('./invoiceNumberController');
const { Op } = require('sequelize');


// 🛒 CREAR FACTURA FISCAL DESDE BILL (E-COMMERCE)
const createInvoiceFromBill = async (req, res) => {
  let createdInvoice = null;
  
  try {
    console.log('=== Iniciando proceso de facturación fiscal E-COMMERCE ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { idBill } = req.body;

    if (!idBill) {
      return res.status(400).json({
        message: 'El ID de la factura (Bill) es obligatorio',
        success: false,
      });
    }

    // 🔧 BUSCAR LA FACTURA INTERNA (BILL) CON DATOS RELACIONADOS
    const bill = await Bill.findOne({
      where: { idBill },
      include: [
        {
          model: OrderDetail,
          as: 'orderDetail',
          include: [
            {
              model: User,
              attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']  // ✅ Corrección en TaxxaService
            },
            {
              model: Product,
              as: 'products',
              include: [
                {
                  model: Image,
                  as: 'Images',  // ✅ Corregido alias
                  attributes: ['url'],
                  limit: 1
                }
              ]
            }
          ]
        }
      ]
    });

    if (!bill) {
      return res.status(404).json({
        message: 'Factura interna no encontrada',
        success: false,
      });
    }

    // 🔧 VERIFICAR SI YA EXISTE UNA FACTURA FISCAL PARA ESTA BILL
    const existingInvoice = await Invoice.findOne({
      where: { 
        billId: bill.idBill,
        status: 'sent'
      }
    });

    if (existingInvoice) {
      console.log('✅ Ya existe una factura fiscal enviada para esta Bill');
      return res.status(200).json({
        message: 'Ya existe una factura fiscal enviada para esta orden',
        success: true,
        data: {
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.getFullInvoiceNumber(),
          cufe: existingInvoice.cufe,
          sentAt: existingInvoice.sentToTaxxaAt
        }
      });
    }

    const orderDetail = bill.orderDetail;
    const user = orderDetail?.User;

    if (!orderDetail || !user) {
      return res.status(400).json({
        message: 'Datos incompletos de orden o usuario',
        success: false,
      });
    }

    // Validar que la factura interna esté pagada
    if (bill.status !== 'paid') {
      return res.status(400).json({
        message: 'La factura debe estar pagada',
        success: false
      });
    }

    // 🔧 BUSCAR O CREAR BUYER DESDE USER
    let buyer = await Buyer.findOne({
      where: { n_document: user.n_document }
    });

    if (!buyer) {
      return res.status(400).json({
        message: 'Debe crear el perfil fiscal del comprador antes de generar factura',
        success: false,
        suggestion: `Use POST /buyer/check/${user.n_document} para crear el perfil fiscal`
      });
    }

    // 🔧 OBTENER DATOS DEL VENDEDOR
    const sellerData = await SellerData.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!sellerData) {
      return res.status(404).json({
        message: 'Datos del vendedor no encontrados',
        success: false,
      });
    }

    // 🔧 CREAR FACTURA FISCAL CON NUMERACIÓN SECUENCIAL
    try {
      createdInvoice = await createInvoiceWithNumber({
        billId: bill.idBill,
        buyerId: buyer.n_document,
        buyerName: buyer.scostumername,
        buyerEmail: buyer.selectronicmail,
        sellerId: sellerData.sdocno,
        sellerName: sellerData.scostumername,
        totalAmount: bill.totalAmount,
        taxAmount: bill.taxAmount || 0,
        netAmount: parseFloat(bill.totalAmount) - parseFloat(bill.taxAmount || 0),
        orderReference: `ORDER-${orderDetail.id_orderDetail}-${bill.idBill.slice(-8)}`
      });

      console.log(`✅ Factura fiscal creada: ${createdInvoice.getFullInvoiceNumber()}`);
    } catch (invoiceError) {
      console.error('❌ Error creando factura fiscal:', invoiceError.message);
      return res.status(500).json({
        message: 'Error en la numeración de facturas fiscales',
        success: false,
        error: invoiceError.message
      });
    }

    // 🔧 CONSTRUIR DOCUMENTO PARA TAXXA - ADAPTADO PARA E-COMMERCE
    console.log('=== Construyendo documento para Taxxa E-COMMERCE ===');

    // 🔧 CALCULAR TOTALES
    const subtotalAmount = parseFloat(bill.subtotalAmount) || parseFloat(bill.totalAmount);
    const taxAmount = parseFloat(bill.taxAmount) || 0;
    const totalAmount = parseFloat(bill.totalAmount);

    // 🔧 MAPEAR TIPOS DE DOCUMENTO
    const mapDocTypeToText = (code) => {
      const mapping = {
        11: "RC", 12: "TI", 13: "CC", 21: "CE", 22: "CD", 
        31: "NIT", 41: "PA", 42: "PEP", 50: "NIT", 91: "NUIP"
      };
      return mapping[code] || "CC";
    };

    // 🆕 FUNCIÓN PARA CONVERTIR NÚMERO A PALABRAS
    const numberToWords = (num) => {
      return `${Math.round(num).toLocaleString()} pesos colombianos`;
    };

    const currentDate = new Date().toISOString().split('T')[0];

    // 🔧 CONSTRUIR ITEMS DESDE PRODUCTOS
    const jdocumentitems = {};
    if (orderDetail.products && orderDetail.products.length > 0) {
      orderDetail.products.forEach((product, index) => {
        const unitPrice = parseFloat(product.price) || 0;
        const quantity = parseFloat(orderDetail.quantity) || 1;
        const itemTotal = unitPrice * quantity;
        const itemTax = itemTotal * 0.19; // 19% IVA

        jdocumentitems[index.toString()] = {
          jextrainfo: {
            sbarcode: `PROD-${product.id_product}`
          },
          sdescription: product.description || product.name,
          wunitcode: "und",
          sstandarditemidentification: `PROD-${product.id_product}`,
          sstandardidentificationcode: "999",
          nunitprice: unitPrice,
          nusertotal: itemTotal,
          nquantity: quantity,
          jtax: {
            jiva: {
              nrate: 19,
              sname: "IVA",
              namount: itemTax,
              nbaseamount: itemTotal
            }
          }
        };
      });
    } else {
      // Item genérico si no hay productos específicos
      jdocumentitems["0"] = {
        jextrainfo: {
          sbarcode: `ORDER-${orderDetail.id_orderDetail}`
        },
        sdescription: `Venta de productos - Orden ${orderDetail.id_orderDetail}`,
        wunitcode: "und",
        sstandarditemidentification: `ORDER-${orderDetail.id_orderDetail}`,
        sstandardidentificationcode: "999",
        nunitprice: subtotalAmount,
        nusertotal: subtotalAmount,
        nquantity: 1,
        jtax: {
          jiva: {
            nrate: taxAmount > 0 ? 19 : 0,
            sname: "IVA",
            namount: taxAmount,
            nbaseamount: subtotalAmount
          }
        }
      };
    }

    // 🆕 ESTRUCTURA PARA TAXXA E-COMMERCE
    const documentBody = {
      sMethod: 'classTaxxa.fjDocumentAdd',
      jParams: {
        wVersionUBL: "2.1",
        wenvironment: "prod",
        jDocument: {
          wversionubl: "2.1",
          wenvironment: "prod",
          wdocumenttype: "Invoice",
          wdocumenttypecode: "01",
          scustomizationid: "10",
          wcurrency: "COP",
          
          // 🔧 NUMERACIÓN
          sdocumentprefix: createdInvoice.prefix,
          sdocumentsuffix: parseInt(createdInvoice.invoiceSequentialNumber),
          
          // 🔧 FECHAS
          tissuedate: currentDate,
          tduedate: currentDate,
          
          // 🔧 INFORMACIÓN DE PAGO
          wpaymentmeans: 1,
          wpaymentmethod: "10",
          
          // 🔧 TOTALES
          nlineextensionamount: subtotalAmount,
          ntaxexclusiveamount: subtotalAmount,
          ntaxinclusiveamount: totalAmount,
          npayableamount: totalAmount,
          
          // 🔧 REFERENCIAS
          sorderreference: createdInvoice.orderReference,
          snotes: `Venta e-commerce - Dirección de entrega: ${orderDetail.deliveryAddress || orderDetail.address || 'No especificada'}`,
          snotetop: "",
          
          // 🆕 INFORMACIÓN EXTRA
          jextrainfo: {
            ntotalinvoicepayment: totalAmount,
            stotalinvoicewords: numberToWords(totalAmount),
            iitemscount: Object.keys(jdocumentitems).length.toString()
          },
          
          // 🔧 ITEMS
          jdocumentitems,
          
          // 🔧 COMPRADOR
          jbuyer: {
            wlegalorganizationtype: buyer.wlegalorganizationtype || "person",
            scostumername: buyer.scostumername,
            stributaryidentificationkey: "O-1",
            stributaryidentificationname: "IVA",
            sfiscalresponsibilities: buyer.sfiscalresponsibilities || "R-99-PN",
            sfiscalregime: "48",
            jpartylegalentity: {
              wdoctype: mapDocTypeToText(buyer.wdoctype),
              sdocno: buyer.sdocno,
              scorporateregistrationschemename: buyer.scostumername
            },
            jcontact: {
              scontactperson: buyer.scontactperson || buyer.scostumername,
              selectronicmail: buyer.selectronicmail,
              stelephone: buyer.stelephone?.replace(/^\+57/, '') || "3000000000",
              ...(buyer.jregistrationaddress && {
                jregistrationaddress: buyer.jregistrationaddress
              })
            }
          },
          
          // 🔧 VENDEDOR
          jseller: {
            wlegalorganizationtype: sellerData.wlegalorganizationtype === "person" ? "person" : "company",
            sfiscalresponsibilities: sellerData.sfiscalresponsibilities,
            sdocno: sellerData.sdocno,
            sdoctype: mapDocTypeToText(sellerData.sdoctype),
            ssellername: sellerData.scostumername,
            ssellerbrand: sellerData.ssellerbrand || sellerData.scostumername,
            scontactperson: sellerData.scontactperson?.trim(),
            saddresszip: sellerData.spostalcode || "00000",
            wdepartmentcode: sellerData.registration_wdepartmentcode || "11",
            wtowncode: sellerData.registration_wprovincecode || "11001",
            scityname: sellerData.registration_scityname || sellerData.scity,
            jcontact: {
              selectronicmail: sellerData.selectronicmail,
              jregistrationaddress: {
                wdepartmentcode: sellerData.registration_wdepartmentcode || "11",
                sdepartmentname: sellerData.registration_sdepartmentname || "Cundinamarca",
                scityname: sellerData.registration_scityname || sellerData.scity,
                saddressline1: sellerData.registration_saddressline1 || sellerData.saddress,
                scountrycode: sellerData.registration_scountrycode || "CO",
                wprovincecode: sellerData.registration_wprovincecode || "11",
                szip: sellerData.registration_szip || sellerData.spostalcode || "00000"
              }
            }
          }
        }
      }
    };

    console.log('📄 Documento E-COMMERCE construido:', JSON.stringify(documentBody, null, 2));

    // 🔧 GENERAR TOKEN
    console.log('=== Generando token para Taxxa ===');
    const token = await generateToken();
    if (!token) {
      await cancelInvoice(createdInvoice.id);
      throw new Error('No se pudo generar el token de autenticación');
    }

    // 🔧 PREPARAR PAYLOAD FINAL
    const taxxaPayload = {
      stoken: token,
      jApi: documentBody
    };

    console.log('=== Enviando documento E-COMMERCE a Taxxa ===');

    // 🔧 ENVIAR DOCUMENTO
    const taxxaResponse = await sendDocument(taxxaPayload);
    console.log('Respuesta de Taxxa:', JSON.stringify(taxxaResponse, null, 2));

    if (taxxaResponse && taxxaResponse.rerror === 0) {
      console.log('=== Factura E-COMMERCE enviada exitosamente ===');

      // 🔧 EXTRAER QR CODE DE LA RESPUESTA
      let qrCode = null;
      if (taxxaResponse?.jret?.sqr) {
        const match = taxxaResponse.jret.sqr.match(/https?:\/\/[^\s]+/);
        if (match) {
          qrCode = match[0];
        }
      }

      // 🔧 MARCAR FACTURA FISCAL COMO ENVIADA
      await createdInvoice.markAsSent(taxxaResponse);

      // 🔧 ACTUALIZAR FACTURA INTERNA CON REFERENCIA Y QR
      await bill.update({
        taxxaStatus: 'sent',
        taxInvoiceId: createdInvoice.getFullInvoiceNumber(),
        cufe: taxxaResponse.jApiResponse?.cufe 
          || taxxaResponse.scufe 
          || taxxaResponse.cufe 
          || taxxaResponse.jret?.scufe,
        taxxaResponse: taxxaResponse,
        sentToTaxxaAt: new Date(),
        qrCode
      });

      return res.status(200).json({
        message: 'Factura fiscal E-COMMERCE enviada a Taxxa con éxito',
        success: true,
        data: {
          invoiceId: createdInvoice.id,
          invoiceNumber: createdInvoice.getFullInvoiceNumber(),
          billId: bill.idBill,
          orderDetailId: orderDetail.id_orderDetail,
          cufe: taxxaResponse.jApiResponse?.cufe 
            || taxxaResponse.scufe 
            || taxxaResponse.jret?.scufe,
          qrCode,
          totalAmount: createdInvoice.totalAmount,
          sentAt: createdInvoice.sentToTaxxaAt,
          customer: {
            name: buyer.scostumername,
            document: buyer.sdocno,
            email: buyer.selectronicmail
          },
          products: orderDetail.products?.map(p => ({
            name: p.name,
            price: p.price
          })) || []
        }
      });
          
    } else {
      console.error('Error en respuesta de Taxxa:', taxxaResponse);
      
      // 🔧 MARCAR FACTURA FISCAL COMO FALLIDA
      await createdInvoice.markAsFailed(new Error(taxxaResponse?.smessage || 'Error desconocido'));
      
      throw new Error(`Error en la respuesta de Taxxa: ${taxxaResponse?.smessage || JSON.stringify(taxxaResponse)}`);
    }

  } catch (error) {
    console.error('=== Error en el proceso de facturación E-COMMERCE ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // 🔧 CANCELAR FACTURA FISCAL SI SE CREÓ
    if (createdInvoice) {
      try {
        await cancelInvoice(createdInvoice.id);
      } catch (cancelError) {
        console.error('Error cancelando factura fiscal:', cancelError.message);
      }
    }
    
    return res.status(500).json({
      message: 'Error al procesar la factura E-COMMERCE',
      success: false,
      error: error.message,
    });
  }
};

const createInvoice = async (req, res) => {
  let createdInvoice = null;
  
  try {
    console.log('=== Iniciando proceso de facturación fiscal ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { idBill } = req.body;

    if (!idBill) {
      return res.status(400).json({
        message: 'El ID de la factura (Bill) es obligatorio',
        success: false,
      });
    }

    // 🔧 BUSCAR LA FACTURA INTERNA (BILL)
    const bill = await Bill.findOne({
      where: { idBill },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Buyer,
              as: 'guest',
            },
          ],
        },
      ],
    });

    if (!bill) {
      return res.status(404).json({
        message: 'Factura interna no encontrada',
        success: false,
      });
    }

    // 🔧 VERIFICAR SI YA EXISTE UNA FACTURA FISCAL PARA ESTA BILL
    const existingInvoice = await Invoice.findOne({
      where: { 
        billId: bill.idBill,
        status: 'sent'
      }
    });

    if (existingInvoice) {
      console.log('✅ Ya existe una factura fiscal enviada para esta Bill');
      return res.status(200).json({
        message: 'Ya existe una factura fiscal enviada para esta reserva',
        success: true,
        data: {
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.getFullInvoiceNumber(),
          cufe: existingInvoice.cufe,
          sentAt: existingInvoice.sentToTaxxaAt
        }
      });
    }

    const booking = bill.booking;
    const buyer = booking?.guest;

    if (!booking || !buyer) {
      return res.status(400).json({
        message: 'Datos incompletos de reserva o huésped',
        success: false,
      });
    }

    // Validar que la factura interna esté pagada
    if (bill.status !== 'paid') {
      return res.status(400).json({
        message: 'La factura debe estar pagada',
        success: false
      });
    }

    if (bill.taxxaStatus === 'sent' && bill.taxInvoiceId) {
      return res.status(200).json({
        message: 'Factura ya enviada exitosamente',
        success: true,
        data: { taxInvoiceId: bill.taxInvoiceId }
      });
    }

    // 🔧 OBTENER DATOS DEL VENDEDOR
    const sellerData = await SellerData.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!sellerData) {
      return res.status(404).json({
        message: 'Datos del vendedor no encontrados',
        success: false,
      });
    }

    // 🔧 CREAR FACTURA FISCAL CON NUMERACIÓN SECUENCIAL
    try {
      createdInvoice = await createInvoiceWithNumber({
        billId: bill.idBill,
        buyerId: buyer.sdocno,
        buyerName: buyer.scostumername,
        buyerEmail: buyer.selectronicmail,
        sellerId: sellerData.sdocno,
        sellerName: sellerData.scostumername,
        totalAmount: bill.totalAmount,
        taxAmount: bill.taxAmount || 0,
        netAmount: parseFloat(bill.totalAmount) - parseFloat(bill.taxAmount || 0),
        orderReference: `BOOKING-${booking.bookingId}-${bill.idBill.slice(-8)}`
      });

      console.log(`✅ Factura fiscal creada: ${createdInvoice.getFullInvoiceNumber()}`);
    } catch (invoiceError) {
      console.error('❌ Error creando factura fiscal:', invoiceError.message);
      return res.status(500).json({
        message: 'Error en la numeración de facturas fiscales',
        success: false,
        error: invoiceError.message
      });
    }

    // 🔧 CONSTRUIR DOCUMENTO PARA TAXXA - ESTRUCTURA CORREGIDA SEGÚN TU PROYECTO QUE FUNCIONA
    console.log('=== Construyendo documento para Taxxa (estructura corregida) ===');

    // 🔧 CALCULAR TOTALES PRIMERO
    const baseAmount = parseFloat(bill.reservationAmount);
    const extraAmount = parseFloat(bill.extraChargesAmount) || 0;
    const totalBase = baseAmount + extraAmount;
    const taxAmount = parseFloat(bill.taxAmount) || 0;
    const totalWithTax = totalBase + taxAmount;

    // 🔧 MAPEAR TIPOS DE DOCUMENTO
    const mapDocTypeToText = (code) => {
      const mapping = {
        11: "RC", 12: "TI", 13: "CC", 21: "CE", 22: "CD", 
        31: "NIT", 41: "PA", 42: "PEP", 50: "NIT", 91: "NUIP"
      };
      return mapping[code] || "CC";
    };

    // 🆕 FUNCIÓN PARA CONVERTIR NÚMERO A PALABRAS
    const numberToWords = (num) => {
      const numbers = {
        140000: "ciento cuarenta mil",
        160000: "ciento sesenta mil",
        100000: "cien mil",
        120000: "ciento veinte mil",
        150000: "ciento cincuenta mil",
        180000: "ciento ochenta mil",
        200000: "doscientos mil"
      };
      
      if (numbers[num]) return numbers[num];
      return `${num.toLocaleString()} pesos`;
    };

    const currentDate = new Date().toISOString().split('T')[0]; // "2025-06-22"

    // 🆕 ESTRUCTURA CORREGIDA SEGÚN TU PROYECTO QUE FUNCIONA
    const documentBody = {
      sMethod: 'classTaxxa.fjDocumentAdd',
      jParams: {
        wVersionUBL: "2.1", // ⭐ Como string, igual que tu proyecto
        wenvironment: "prod",
        jDocument: {
          // ⭐ CAMPOS DIRECTOS EN jDocument (IGUAL QUE TU PROYECTO QUE FUNCIONA)
          wversionubl: "2.1",
          wenvironment: "prod",
          wdocumenttype: "Invoice",
          wdocumenttypecode: "01",
          scustomizationid: "10",
          wcurrency: "COP",
          
          // 🔧 NUMERACIÓN
          sdocumentprefix: createdInvoice.prefix,
          sdocumentsuffix: parseInt(createdInvoice.invoiceSequentialNumber),
          
          // 🔧 FECHAS
          tissuedate: currentDate,
          tduedate: currentDate,
          
          // 🔧 INFORMACIÓN DE PAGO
          wpaymentmeans: 1,
          wpaymentmethod: "10",
          
          // 🔧 TOTALES
          nlineextensionamount: totalBase,
          ntaxexclusiveamount: totalBase,
          ntaxinclusiveamount: totalWithTax,
          npayableamount: totalWithTax,
          
          // 🔧 REFERENCIAS
          sorderreference: createdInvoice.orderReference,
          snotes: "",
          snotetop: "",
          
          // 🆕 INFORMACIÓN EXTRA
          jextrainfo: {
            ntotalinvoicepayment: totalWithTax,
            stotalinvoicewords: numberToWords(totalWithTax),
            iitemscount: extraAmount > 0 ? "2" : "1"
          },
          
          // 🔧 ITEMS
          jdocumentitems: {
            "0": {
              jextrainfo: {
                sbarcode: `SERV001-${booking.roomNumber}`
              },
              sdescription: `Servicios de hospedaje - Habitación ${booking.roomNumber}`,
              wunitcode: "und",
              sstandarditemidentification: `SERV001-${booking.roomNumber}`,
              sstandardidentificationcode: "999",
              nunitprice: totalBase, // 🔴 USAR totalBase COMO EN EL EJEMPLO
              nusertotal: totalBase,
              nquantity: 1,
              jtax: {
                jiva: {
                  nrate: taxAmount > 0 ? 19 : 0,
                  sname: "IVA",
                  namount: taxAmount,
                  nbaseamount: totalBase
                }
              }
            }
          },
          
          // 🔧 COMPRADOR - ESTRUCTURA IGUAL QUE EL EJEMPLO QUE FUNCIONA
          jbuyer: {
            wlegalorganizationtype: buyer.wlegalorganizationtype || "person",
            scostumername: buyer.scostumername,
            stributaryidentificationkey: "O-1",
            stributaryidentificationname: "IVA", // ⭐ CAMPO PRESENTE EN EL EJEMPLO
            sfiscalresponsibilities: buyer.sfiscalresponsibilities || "R-99-PN",
            sfiscalregime: "48",
            jpartylegalentity: {
              wdoctype: mapDocTypeToText(buyer.wdoctype),
              sdocno: buyer.sdocno,
              scorporateregistrationschemename: buyer.scostumername // ⭐ USAR NOMBRE DEL COMPRADOR
            },
            jcontact: {
              scontactperson: buyer.scontactperson || buyer.scostumername,
              selectronicmail: buyer.selectronicmail,
              stelephone: buyer.stelephone?.replace(/^\+57/, '') || "3000000000",
              // 🆕 DIRECCIÓN DEL COMPRADOR SI EXISTE
              ...(buyer.jregistrationaddress && {
                jregistrationaddress: {
                  scountrycode: buyer.jregistrationaddress.scountrycode || "CO",
                  wdepartmentcode: buyer.jregistrationaddress.wdepartmentcode || "11",
                  wtowncode: buyer.jregistrationaddress.wtowncode || "11001",
                  scityname: buyer.jregistrationaddress.scityname || "Bogotá",
                  saddressline1: buyer.jregistrationaddress.saddressline1 || "Dirección no especificada",
                  szip: buyer.jregistrationaddress.szip || "00000"
                }
              })
            }
          },
          
          // 🔧 VENDEDOR - ESTRUCTURA IGUAL QUE TU PROYECTO QUE FUNCIONA
          jseller: {
            wlegalorganizationtype: sellerData.wlegalorganizationtype === "person" ? "person" : "company",
            sfiscalresponsibilities: sellerData.sfiscalresponsibilities,
            sdocno: sellerData.sdocno,
            sdoctype: mapDocTypeToText(sellerData.sdoctype),
            ssellername: sellerData.scostumername,
            ssellerbrand: sellerData.ssellerbrand || sellerData.scostumername,
            scontactperson: sellerData.scontactperson?.trim(),
            saddresszip: sellerData.spostalcode || "00000",
            wdepartmentcode: sellerData.registration_wdepartmentcode || "11",
            wtowncode: sellerData.registration_wprovincecode || "11001",
            scityname: sellerData.registration_scityname || sellerData.scity,
            jcontact: {
              selectronicmail: sellerData.selectronicmail,
              jregistrationaddress: {
                wdepartmentcode: sellerData.registration_wdepartmentcode || "11",
                sdepartmentname: sellerData.registration_sdepartmentname || "Cundinamarca",
                scityname: sellerData.registration_scityname || sellerData.scity,
                saddressline1: sellerData.registration_saddressline1 || sellerData.saddress,
                scountrycode: sellerData.registration_scountrycode || "CO",
                wprovincecode: sellerData.registration_wprovincecode || "11",
                szip: sellerData.registration_szip || sellerData.spostalcode || "00000"
              }
            }
          }
        }
      }
    };

    // 🔧 AGREGAR SERVICIOS ADICIONALES SI EXISTEN
    if (extraAmount > 0) {
      documentBody.jParams.jDocument.jdocumentitems["1"] = {
        jextrainfo: {
          sbarcode: "SERV002-EXTRA"
        },
        sdescription: "Servicios adicionales y consumos",
        wunitcode: "und",
        sstandarditemidentification: "SERV002-EXTRA",
        sstandardidentificationcode: "999",
        nunitprice: extraAmount,
        nusertotal: extraAmount,
        nquantity: 1,
        jtax: {
          jiva: {
            nrate: 19, // IVA para extras
            sname: "IVA",
            namount: extraAmount * 0.19,
            nbaseamount: extraAmount
          }
        }
      };
      
      // Actualizar contador de items
      documentBody.jParams.jDocument.jextrainfo.iitemscount = "2";
    }

    console.log('📄 Documento con estructura corregida:', JSON.stringify(documentBody, null, 2));

    // 🔧 GENERAR TOKEN
    console.log('=== Generando token para Taxxa ===');
    const token = await generateToken();
    if (!token) {
      await cancelInvoice(createdInvoice.id);
      throw new Error('No se pudo generar el token de autenticación');
    }

    // 🔧 PREPARAR PAYLOAD FINAL - IGUAL QUE TU PROYECTO QUE FUNCIONA
    const taxxaPayload = {
      stoken: token,
      jApi: documentBody // ⭐ ESTRUCTURA IGUAL QUE TU PROYECTO
    };

    console.log('=== Enviando documento a Taxxa ===');
    console.log('Payload a enviar:', JSON.stringify(taxxaPayload, null, 2));

    // 🔧 ENVIAR DOCUMENTO
const taxxaResponse = await sendDocument(taxxaPayload);
console.log('Respuesta de Taxxa:', JSON.stringify(taxxaResponse, null, 2));

if (taxxaResponse && taxxaResponse.rerror === 0) {
  console.log('=== Factura fiscal enviada exitosamente ===');

  // 🔧 EXTRAER QR CODE DE LA RESPUESTA
  let qrCode = null;
  if (taxxaResponse?.jret?.sqr) {
    const match = taxxaResponse.jret.sqr.match(/https?:\/\/[^\s]+/);
    if (match) {
      qrCode = match[0];
    }
  }

  // 🔧 MARCAR FACTURA FISCAL COMO ENVIADA
  await createdInvoice.markAsSent(taxxaResponse);

  // 🔧 ACTUALIZAR FACTURA INTERNA CON REFERENCIA Y QR
  await bill.update({
    taxxaStatus: 'sent',
    taxInvoiceId: createdInvoice.getFullInvoiceNumber(),
    cufe: taxxaResponse.jApiResponse?.cufe 
      || taxxaResponse.scufe 
      || taxxaResponse.cufe 
      || taxxaResponse.jret?.scufe,
    taxxaResponse: taxxaResponse,
    sentToTaxxaAt: new Date(),
    qrCode // <--- Guarda el QR aquí
  });

  return res.status(200).json({
    message: 'Factura fiscal enviada a Taxxa con éxito',
    success: true,
    data: {
      invoiceId: createdInvoice.id,
      invoiceNumber: createdInvoice.getFullInvoiceNumber(),
      billId: bill.idBill,
      cufe: taxxaResponse.jApiResponse?.cufe 
        || taxxaResponse.scufe 
        || taxxaResponse.jret?.scufe,
      qrCode, // <--- Devuelve el QR también
      totalAmount: createdInvoice.totalAmount,
      sentAt: createdInvoice.sentToTaxxaAt,
      taxxaResponse: taxxaResponse
    }
  });
      
    } else {
      console.error('Error en respuesta de Taxxa:', taxxaResponse);
      
      // 🔧 MARCAR FACTURA FISCAL COMO FALLIDA
      await createdInvoice.markAsFailed(new Error(taxxaResponse?.smessage || 'Error desconocido'));
      
      throw new Error(`Error en la respuesta de Taxxa: ${taxxaResponse?.smessage || JSON.stringify(taxxaResponse)}`);
    }

  } catch (error) {
    console.error('=== Error en el proceso de facturación fiscal ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // 🔧 CANCELAR FACTURA FISCAL SI SE CREÓ
    if (createdInvoice) {
      try {
        await cancelInvoice(createdInvoice.id);
      } catch (cancelError) {
        console.error('Error cancelando factura fiscal:', cancelError.message);
      }
    }
    
    return res.status(500).json({
      message: 'Error al procesar la factura fiscal',
      success: false,
      error: error.message,
    });
  }
};

const createManualInvoice = async (req, res) => {
  let createdInvoice = null;
  
  try {
    console.log('=== Iniciando proceso de facturación MANUAL ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { buyer, items, notes = 'Factura manual' } = req.body;

    // ✅ VALIDACIONES
    if (!buyer?.document || !buyer?.name) {
      return res.status(400).json({
        message: 'Datos del comprador son obligatorios (documento y nombre)',
        success: false,
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Debe incluir al menos un item para facturar',
        success: false,
      });
    }

    // Validar cada item
    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        return res.status(400).json({
          message: 'Cada item debe tener descripción, cantidad y precio unitario',
          success: false,
        });
      }
    }

    // 🔧 CALCULAR TOTALES
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    }, 0);
    
    const taxRate = 0.19; // 19% IVA
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    console.log('💰 Totales calculados:', { subtotal, taxAmount, totalAmount });

    // 🔧 CREAR O BUSCAR COMPRADOR (igual que tu lógica actual)
    let buyerRecord = await Buyer.findOne({
      where: { sdocno: buyer.document }
    });

    if (!buyerRecord) {
      console.log('👤 Creando nuevo comprador...');
      buyerRecord = await Buyer.create({
        sdocno: buyer.document,
        scostumername: buyer.name,
        selectronicmail: buyer.email || '',
        stelephone: buyer.phone || '',
        wdoctype: buyer.docType || 13, // CC por defecto
        sfiscalresponsibilities: 'R-99-PN', // Persona natural por defecto
        // Agregar dirección si viene
        ...(buyer.address && {
          jregistrationaddress: {
            scountrycode: buyer.country || "CO",
            wdepartmentcode: buyer.departmentCode || "11",
            wtowncode: buyer.cityCode || "11001",
            scityname: buyer.city || "Bogotá",
            saddressline1: buyer.address,
            szip: buyer.zipCode || "00000"
          }
        })
      });
    } else {
      console.log('👤 Comprador existente encontrado');
    }

    // 🔧 OBTENER VENDEDOR (igual que tu lógica actual)
    const sellerData = await SellerData.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!sellerData) {
      return res.status(404).json({
        message: 'Datos del vendedor no encontrados',
        success: false,
      });
    }

    // 🔧 CREAR BILL MANUAL
    const bill = await Bill.create({
      buyerId: buyerRecord.sdocno,
      sellerId: sellerData.sdocno,
      totalAmount: totalAmount,
      taxAmount: taxAmount,
      reservationAmount: subtotal, // Base sin impuestos
      extraChargesAmount: 0,
      status: 'paid', // Las facturas manuales ya están pagadas
      billType: 'manual',
      notes: notes,
      paymentMethod: 'cash', // Por defecto efectivo
      taxxaStatus: 'pending'
    });

    console.log('📄 Bill manual creada:', bill.idBill);

    // ⭐ USAR TU LÓGICA EXISTENTE PARA CREAR INVOICE CON NUMERACIÓN
    try {
      createdInvoice = await createInvoiceWithNumber({
        billId: bill.idBill,
        buyerId: buyerRecord.sdocno,
        buyerName: buyerRecord.scostumername,
        buyerEmail: buyerRecord.selectronicmail,
        sellerId: sellerData.sdocno,
        sellerName: sellerData.scostumername,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        netAmount: subtotal,
        orderReference: `MANUAL-${Date.now()}-${bill.idBill.slice(-8)}`
      });

      console.log(`✅ Factura fiscal manual creada: ${createdInvoice.getFullInvoiceNumber()}`);
    } catch (invoiceError) {
      console.error('❌ Error creando factura fiscal:', invoiceError.message);
      return res.status(500).json({
        message: 'Error en la numeración de facturas fiscales',
        success: false,
        error: invoiceError.message
      });
    }

    // 🔧 CONSTRUIR DOCUMENTO PARA TAXXA (adaptando tu estructura existente)
    console.log('=== Construyendo documento MANUAL para Taxxa ===');

    const mapDocTypeToText = (code) => {
      const mapping = {
        11: "RC", 12: "TI", 13: "CC", 21: "CE", 22: "CD", 
        31: "NIT", 41: "PA", 42: "PEP", 50: "NIT", 91: "NUIP"
      };
      return mapping[code] || "CC";
    };

    const numberToWords = (num) => {
      // Función simplificada - puedes expandir según necesites
      return `${Math.round(num).toLocaleString()} pesos colombianos`;
    };

    const currentDate = new Date().toISOString().split('T')[0];

    // ⭐ ADAPTAR TU ESTRUCTURA EXISTENTE PARA ITEMS MANUALES
    const jdocumentitems = {};
    items.forEach((item, index) => {
      jdocumentitems[index.toString()] = {
        jextrainfo: {
          sbarcode: `MANUAL-${index + 1}`
        },
        sdescription: item.description,
        wunitcode: "und",
        sstandarditemidentification: `MANUAL-ITEM-${index + 1}`,
        sstandardidentificationcode: "999",
        nunitprice: parseFloat(item.unitPrice),
        nusertotal: parseFloat(item.quantity) * parseFloat(item.unitPrice),
        nquantity: parseFloat(item.quantity),
        jtax: {
          jiva: {
            nrate: item.taxRate || 19,
            sname: "IVA",
            namount: (parseFloat(item.quantity) * parseFloat(item.unitPrice)) * ((item.taxRate || 19) / 100),
            nbaseamount: parseFloat(item.quantity) * parseFloat(item.unitPrice)
          }
        }
      };
    });

    // ⭐ USAR EXACTAMENTE TU ESTRUCTURA EXISTENTE
    const documentBody = {
      sMethod: 'classTaxxa.fjDocumentAdd',
      jParams: {
        wVersionUBL: "2.1",
        wenvironment: "prod",
        jDocument: {
          wversionubl: "2.1",
          wenvironment: "prod",
          wdocumenttype: "Invoice",
          wdocumenttypecode: "01",
          scustomizationid: "10",
          wcurrency: "COP",
          
          // Numeración
          sdocumentprefix: createdInvoice.prefix,
          sdocumentsuffix: parseInt(createdInvoice.invoiceSequentialNumber),
          
          // Fechas
          tissuedate: currentDate,
          tduedate: currentDate,
          
          // Información de pago
          wpaymentmeans: 1,
          wpaymentmethod: "10",
          
          // Totales
          nlineextensionamount: subtotal,
          ntaxexclusiveamount: subtotal,
          ntaxinclusiveamount: totalAmount,
          npayableamount: totalAmount,
          
          // Referencias
          sorderreference: createdInvoice.orderReference,
          snotes: notes,
          snotetop: "",
          
          // Información extra
          jextrainfo: {
            ntotalinvoicepayment: totalAmount,
            stotalinvoicewords: numberToWords(totalAmount),
            iitemscount: items.length.toString()
          },
          
          // Items dinámicos
          jdocumentitems,
          
          // ⭐ COMPRADOR (igual que tu estructura)
          jbuyer: {
            wlegalorganizationtype: buyerRecord.wlegalorganizationtype || "person",
            scostumername: buyerRecord.scostumername,
            stributaryidentificationkey: "O-1",
            stributaryidentificationname: "IVA",
            sfiscalresponsibilities: buyerRecord.sfiscalresponsibilities || "R-99-PN",
            sfiscalregime: "48",
            jpartylegalentity: {
              wdoctype: mapDocTypeToText(buyerRecord.wdoctype),
              sdocno: buyerRecord.sdocno,
              scorporateregistrationschemename: buyerRecord.scostumername
            },
            jcontact: {
              scontactperson: buyerRecord.scontactperson || buyerRecord.scostumername,
              selectronicmail: buyerRecord.selectronicmail,
              stelephone: buyerRecord.stelephone?.replace(/^\+57/, '') || "3000000000",
              ...(buyerRecord.jregistrationaddress && {
                jregistrationaddress: buyerRecord.jregistrationaddress
              })
            }
          },
          
          // ⭐ VENDEDOR (exactamente igual que tu código existente)
          jseller: {
            wlegalorganizationtype: sellerData.wlegalorganizationtype === "person" ? "person" : "company",
            sfiscalresponsibilities: sellerData.sfiscalresponsibilities,
            sdocno: sellerData.sdocno,
            sdoctype: mapDocTypeToText(sellerData.sdoctype),
            ssellername: sellerData.scostumername,
            ssellerbrand: sellerData.ssellerbrand || sellerData.scostumername,
            scontactperson: sellerData.scontactperson?.trim(),
            saddresszip: sellerData.spostalcode || "00000",
            wdepartmentcode: sellerData.registration_wdepartmentcode || "11",
            wtowncode: sellerData.registration_wprovincecode || "11001",
            scityname: sellerData.registration_scityname || sellerData.scity,
            jcontact: {
              selectronicmail: sellerData.selectronicmail,
              jregistrationaddress: {
                wdepartmentcode: sellerData.registration_wdepartmentcode || "11",
                sdepartmentname: sellerData.registration_sdepartmentname || "Cundinamarca",
                scityname: sellerData.registration_scityname || sellerData.scity,
                saddressline1: sellerData.registration_saddressline1 || sellerData.saddress,
                scountrycode: sellerData.registration_scountrycode || "CO",
                wprovincecode: sellerData.registration_wprovincecode || "11",
                szip: sellerData.registration_szip || sellerData.spostalcode || "00000"
              }
            }
          }
        }
      }
    };

    console.log('📄 Documento manual construido');

    // ⭐ USAR TU LÓGICA EXISTENTE PARA ENVÍO
    console.log('=== Generando token para Taxxa ===');
    const token = await generateToken();
    if (!token) {
      await cancelInvoice(createdInvoice.id);
      throw new Error('No se pudo generar el token de autenticación');
    }

    const taxxaPayload = {
      stoken: token,
      jApi: documentBody
    };

    console.log('=== Enviando factura MANUAL a Taxxa ===');
    const taxxaResponse = await sendDocument(taxxaPayload);

    if (taxxaResponse && taxxaResponse.rerror === 0) {
      console.log('=== Factura MANUAL enviada exitosamente ===');

      // QR Code
      let qrCode = null;
      if (taxxaResponse?.jret?.sqr) {
        const match = taxxaResponse.jret.sqr.match(/https?:\/\/[^\s]+/);
        if (match) {
          qrCode = match[0];
        }
      }

      // Marcar como enviada
      await createdInvoice.markAsSent(taxxaResponse);
      await bill.update({
        taxxaStatus: 'sent',
        taxInvoiceId: createdInvoice.getFullInvoiceNumber(),
        cufe: taxxaResponse.jApiResponse?.cufe || taxxaResponse.scufe || taxxaResponse.jret?.scufe,
        taxxaResponse: taxxaResponse,
        sentToTaxxaAt: new Date(),
        qrCode
      });

      return res.status(200).json({
        message: 'Factura manual enviada a Taxxa con éxito',
        success: true,
        data: {
          invoiceId: createdInvoice.id,
          invoiceNumber: createdInvoice.getFullInvoiceNumber(),
          billId: bill.idBill,
          cufe: taxxaResponse.jApiResponse?.cufe || taxxaResponse.scufe || taxxaResponse.jret?.scufe,
          qrCode,
          totalAmount: createdInvoice.totalAmount,
          sentAt: createdInvoice.sentToTaxxaAt,
          items: items
        }
      });

    } else {
      console.error('Error en respuesta de Taxxa:', taxxaResponse);
      await createdInvoice.markAsFailed(new Error(taxxaResponse?.smessage || 'Error desconocido'));
      throw new Error(`Error en la respuesta de Taxxa: ${taxxaResponse?.smessage || JSON.stringify(taxxaResponse)}`);
    }

  } catch (error) {
    console.error('=== Error en facturación MANUAL ===');
    console.error('Error:', error.message);
    
    if (createdInvoice) {
      try {
        await cancelInvoice(createdInvoice.id);
      } catch (cancelError) {
        console.error('Error cancelando factura fiscal:', cancelError.message);
      }
    }
    
    return res.status(500).json({
      message: 'Error al procesar la factura manual',
      success: false,
      error: error.message,
    });
  }
};

// ⭐ FUNCIÓN AUXILIAR PARA OBTENER DATOS DE FACTURACIÓN MANUAL
const getManualInvoiceData = async (req, res) => {
  try {
    console.log('📋 Obteniendo datos para facturación manual...');

    const nextInvoiceNumber = await getNextInvoiceNumber();
    
    const sellerData = await SellerData.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!sellerData) {
      return res.status(404).json({
        message: 'Datos del vendedor no encontrados',
        success: false,
      });
    }

    res.json({
      success: true,
      data: {
        nextInvoiceNumber,
        fullInvoiceNumber: `FE${nextInvoiceNumber}`,
        seller: {
          id: sellerData.sdocno,
          name: sellerData.scostumername,
          email: sellerData.selectronicmail
        }
      },
      message: 'Datos obtenidos para facturación manual'
    });

  } catch (error) {
    console.error('❌ Error obteniendo datos para facturación manual:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos',
      error: error.message
    });
  }
};

// ⭐ FUNCIÓN PARA BUSCAR COMPRADOR
const searchBuyerForManual = async (req, res) => {
  try {
    const { document } = req.params;
    
    const buyer = await Buyer.findOne({
      where: { sdocno: document },
      attributes: ['sdocno', 'scostumername', 'selectronicmail', 'stelephone', 'jregistrationaddress']
    });

    if (!buyer) {
      return res.json({
        success: true,
        found: false,
        message: 'Comprador no encontrado'
      });
    }

    res.json({
      success: true,
      found: true,
      data: {
        document: buyer.sdocno,
        name: buyer.scostumername,
        email: buyer.selectronicmail,
        phone: buyer.stelephone,
        address: buyer.jregistrationaddress
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error buscando comprador',
      error: error.message
    });
  }
};

// 🆕 FUNCIÓN PARA CREAR NOTA DE CRÉDITO
// 🆕 FUNCIÓN PARA CREAR NOTA DE CRÉDITO - CORREGIDA
// Al inicio de la función createCreditNote, después de la línea existente
const createCreditNote = async (req, res) => {
  console.log('\n🎯 === FUNCIÓN createCreditNote INICIADA ===');
  console.log('  - Timestamp:', new Date().toISOString());
  console.log('  - Request method:', req?.method);
  console.log('  - Request path:', req?.path);
  console.log('  - User info:', {
    id: req?.user?.id,
    role: req?.user?.role,
    email: req?.user?.email
  });

  let createdCreditNote = null;
  
  try {
    console.log('=== Iniciando proceso de nota de crédito ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    console.log('🔍 [STEP 1] Extrayendo datos del body...');
    const { 
      originalInvoiceId,
      creditReason,
      amount,
      description,
      isPartial = false
    } = req.body;

    console.log('  - originalInvoiceId:', originalInvoiceId);
    console.log('  - creditReason:', creditReason);
    console.log('  - amount:', amount);
    console.log('  - description:', description);

    // ✅ VALIDACIONES CON DEBUG
    console.log('🔍 [STEP 2] Validando datos de entrada...');
    
    if (!originalInvoiceId) {
      console.log('❌ [VALIDATION] originalInvoiceId faltante');
      return res.status(400).json({
        message: 'El ID de la factura original es obligatorio',
        success: false,
      });
    }

    if (!creditReason || !['1', '2', '3', '4', '5', '6'].includes(creditReason.toString())) {
      console.log('❌ [VALIDATION] creditReason inválido:', creditReason);
      return res.status(400).json({
        message: 'El motivo de la nota de crédito es obligatorio y debe ser válido (1-6)',
        success: false,
        validReasons: {
          '1': 'Devolución parcial de los bienes y/o no aceptación parcial del servicio',
          '2': 'Anulación de factura electrónica',
          '3': 'Rebaja o descuento parcial o total',
          '4': 'Ajuste de precio',
          '5': 'Descuento comercial por pronto pago',
          '6': 'Descuento comercial por volumen de ventas'
        }
      });
    }

    if (!amount || amount <= 0) {
      console.log('❌ [VALIDATION] amount inválido:', amount);
      return res.status(400).json({
        message: 'El monto de la nota de crédito debe ser mayor a 0',
        success: false,
      });
    }

    console.log('✅ [STEP 2] Validaciones básicas pasadas');

    // 🔧 IMPORTAR SEQUELIZE OP SI NO ESTÁ IMPORTADO
    console.log('🔍 [STEP 3] Verificando imports...');
    
    // Verificar si Op está disponible
    let Op;
    try {
      Op = require('sequelize').Op;
      console.log('✅ [STEP 3] Sequelize Op importado');
    } catch (error) {
      console.error('❌ [STEP 3] Error importando Sequelize Op:', error.message);
      return res.status(500).json({
        message: 'Error de configuración del servidor',
        success: false,
        error: 'Sequelize Op not available'
      });
    }

    // 🔧 BUSCAR FACTURA ORIGINAL CON DEBUG
    console.log('🔍 [STEP 4] Buscando factura original ID:', originalInvoiceId);
    
    let originalInvoice;
    try {
      originalInvoice = await Invoice.findOne({
        where: { 
          id: originalInvoiceId,
          status: 'sent',
          cufe: { [Op.not]: null }
        }
      });
      console.log('✅ [STEP 4] Query ejecutada exitosamente');
    } catch (dbError) {
      console.error('❌ [STEP 4] Error en query de factura original:', dbError.message);
      return res.status(500).json({
        message: 'Error al buscar factura original',
        success: false,
        error: dbError.message
      });
    }

    if (!originalInvoice) {
      console.log('❌ [STEP 4] Factura original no encontrada');
      return res.status(404).json({
        message: 'Factura fiscal original no encontrada, no está enviada o no tiene CUFE válido',
        success: false,
      });
    }

    if (!originalInvoice.cufe) {
      console.log('❌ [STEP 4] CUFE no válido');
      return res.status(400).json({
        message: 'La factura original no tiene CUFE válido, no se puede crear nota de crédito',
        success: false,
      });
    }

    console.log(`✅ [STEP 4] Factura original encontrada: ${originalInvoice.getFullInvoiceNumber()}`);
    console.log(`🔍 CUFE de la factura original: ${originalInvoice.cufe}`);

    // 🔧 OBTENER DATOS RELACIONADOS CON DEBUG
    console.log('🔍 [STEP 5] Obteniendo datos relacionados...');
    
    let bill;
    try {
      bill = await Bill.findOne({
        where: { idBill: originalInvoice.billId },
        include: [
          {
            model: Booking,
            as: 'booking',
            include: [
              {
                model: Buyer,
                as: 'guest',
              },
            ],
          },
        ],
      });
      console.log('✅ [STEP 5] Query de datos relacionados ejecutada');
    } catch (dbError) {
      console.error('❌ [STEP 5] Error en query de datos relacionados:', dbError.message);
      return res.status(500).json({
        message: 'Error al obtener datos relacionados',
        success: false,
        error: dbError.message
      });
    }

    if (!bill || !bill.booking || !bill.booking.guest) {
      console.log('❌ [STEP 5] Datos relacionados no encontrados');
      console.log('  - bill exists:', !!bill);
      console.log('  - booking exists:', !!bill?.booking);
      console.log('  - guest exists:', !!bill?.booking?.guest);
      return res.status(404).json({
        message: 'Datos relacionados no encontrados (bill/booking/guest)',
        success: false,
      });
    }

    console.log('✅ [STEP 5] Datos relacionados obtenidos');

    const booking = bill.booking;
    const buyer = bill.booking.guest;

    // Continuar con el resto del proceso...
    console.log('🔍 [STEP 6] Proceso continúa...');

    // ⚡ RESPUESTA TEMPORAL PARA TESTING
    console.log('🧪 [TESTING] Enviando respuesta de prueba exitosa...');
    
    return res.status(200).json({
      message: 'Proceso de nota de crédito iniciado correctamente (TESTING)',
      success: true,
      debug: {
        step: 'STEP 6 - Datos validados correctamente',
        originalInvoiceFound: true,
        relatedDataFound: true,
        originalInvoiceNumber: originalInvoice.getFullInvoiceNumber(),
        billId: bill.idBill,
        buyerName: buyer.scostumername
      }
    });

  } catch (error) {
    console.error('=== Error en el proceso de nota de crédito ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (createdCreditNote) {
      try {
        await createdCreditNote.destroy();
        console.log('🗑️ [CLEANUP] Nota de crédito cancelada por error');
      } catch (cancelError) {
        console.error('Error cancelando nota de crédito:', cancelError.message);
      }
    }
    
    return res.status(500).json({
      message: 'Error al procesar la nota de crédito',
      success: false,
      error: error.message,
    });
  }
};
// 🔧 ACTUALIZAR EXPORTS
module.exports = {
  createInvoice, // Hotel version (mantener para compatibilidad)
  createInvoiceFromBill, // 🆕 E-commerce version  
  createCreditNote,
  createManualInvoice,
  getManualInvoiceData,
  searchBuyerForManual
};
