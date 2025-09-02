require('dotenv').config();
const { Invoice, Bill, OrderDetail, User, Product, Buyer } = require('../data');

async function testInvoiceCreation() {
  try {
    console.log('🔍 === PRUEBA DE CREACIÓN DE INVOICE PARA E-COMMERCE ===');
    
    // 🔧 DATOS MÍNIMOS PARA PROBAR E-COMMERCE
    const minimalData = {
      billId: 'bill-test-' + Date.now(),
      invoiceSequentialNumber: '1',
      prefix: 'FVE', // Factura Venta Electrónica
      buyerId: '1127578894',
      buyerName: 'Diana Vargas',
      buyerEmail: 'dagtiso@gmail.com',
      sellerId: '1121881455',
      sellerName: 'CASTAÑEDA RIVAS MARIA CATERINE',
      totalAmount: 45000,
      taxAmount: 8550, // IVA 19%
      netAmount: 36450,
      status: 'pending',
      orderReference: 'ORDER-DETAIL-' + Date.now()
    };
    
    console.log('💾 Intentando crear Invoice con datos mínimos...');
    console.log('📋 Datos:', JSON.stringify(minimalData, null, 2));
    
    const invoice = await Invoice.create(minimalData);
    
    console.log('✅ ¡ÉXITO! Invoice creado:', invoice.id);
    
    // Limpiar el registro de prueba
    await invoice.destroy();
    console.log('🧹 Registro de prueba eliminado');
    
    console.log('\n🧪 === PRUEBA COMPLETA CON DATOS REALES ===');
    await testWithRealData();
    
  } catch (error) {
    console.error('❌ Error en prueba:');
    console.error('- Message:', error.message);
    console.error('- SQL:', error.sql);
    console.error('- Parameters:', error.parameters);
    
    if (error.message.includes('invalid input syntax for type integer')) {
      const uuidMatch = error.message.match(/[0-9a-f-]{36}/);
      if (uuidMatch) {
        console.error('🎯 UUID problemático:', uuidMatch[0]);
      }
    }
  } finally {
    const { sequelize } = require('../data');
    await sequelize.close();
    process.exit(0);
  }
}

async function testWithRealData() {
  try {
    // 1. Buscar un OrderDetail existente o crear uno de prueba
    console.log('🔍 Buscando OrderDetails en la base de datos...');
    
    const orderDetail = await OrderDetail.findOne({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'n_document']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'iva']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    if (orderDetail) {
      console.log('✅ OrderDetail encontrado:', {
        id: orderDetail.id,
        userId: orderDetail.userId,
        productId: orderDetail.productId,
        quantity: orderDetail.quantity,
        user: orderDetail.User ? orderDetail.User.name : 'No disponible',
        product: orderDetail.Product ? orderDetail.Product.name : 'No disponible'
      });
      
      // 2. Verificar si ya existe un Bill para este OrderDetail
      let bill = await Bill.findOne({
        where: { orderDetailId: orderDetail.id }
      });
      
      if (!bill) {
        console.log('📝 Creando Bill para el OrderDetail...');
        
        const product = orderDetail.Product;
        const subtotal = product.price * orderDetail.quantity;
        const ivaAmount = (subtotal * (product.iva / 100));
        const total = subtotal + ivaAmount;
        
        bill = await Bill.create({
          orderDetailId: orderDetail.id,
          userId: orderDetail.userId,
          subtotal: subtotal,
          iva: ivaAmount,
          total: total,
          status: 'pending'
        });
        
        console.log('✅ Bill creado:', bill.id);
      } else {
        console.log('📋 Bill existente encontrado:', bill.id);
      }
      
      // 3. Verificar si existe Buyer para el usuario
      const user = orderDetail.User;
      if (user && user.n_document) {
        let buyer = await Buyer.findOne({
          where: { document: user.n_document }
        });
        
        if (!buyer) {
          console.log('👤 Creando Buyer para el usuario...');
          buyer = await Buyer.create({
            document: user.n_document,
            name: user.name,
            email: user.email,
            documentType: 'CC', // Cédula por defecto
            address: 'Dirección de prueba',
            city: 'Bogotá',
            phone: '3001234567'
          });
          console.log('✅ Buyer creado:', buyer.document);
        } else {
          console.log('👤 Buyer existente encontrado:', buyer.document);
        }
        
        // 4. Crear Invoice de prueba
        console.log('🧾 Creando Invoice de prueba...');
        const testInvoice = await Invoice.create({
          billId: bill.id,
          invoiceSequentialNumber: Date.now().toString().slice(-6),
          prefix: 'FVE',
          buyerId: buyer.document,
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          sellerId: '1121881455',
          sellerName: 'CASTAÑEDA RIVAS MARIA CATERINE',
          totalAmount: bill.total,
          taxAmount: bill.iva,
          netAmount: bill.subtotal,
          status: 'pending',
          orderReference: `ORDER-${orderDetail.id}`
        });
        
        console.log('✅ Invoice de prueba creado:', testInvoice.id);
        
        // Limpiar registros de prueba
        await testInvoice.destroy();
        console.log('🧹 Invoice de prueba eliminado');
        
      } else {
        console.log('⚠️ Usuario sin documento de identidad, no se puede crear Buyer');
      }
      
    } else {
      console.log('⚠️ No se encontraron OrderDetails en la base de datos');
      console.log('💡 Tip: Crea primero algunos pedidos desde el frontend para poder probar');
    }
    
  } catch (error) {
    console.error('❌ Error en prueba con datos reales:', error.message);
  }
}

testInvoiceCreation();