const crypto = require('crypto');
const { Payment, OrderDetail } = require('../data');
const { WOMPI_EVENT_KEY } = require('../config/envs');

const wompiController = {
    getEventWompi: async (req, res) => {
        try {
            const event = req.body;
            const { 
                event: eventType, 
                data, 
                signature, 
                timestamp,
                environment 
            } = event;

            console.log(`📨 Webhook recibido - Tipo: ${eventType} - Ambiente: ${environment}`);

            // ✅ PASO 1: Verificar la firma del evento para seguridad
            const isValid = verifyEventSignature(event, WOMPI_EVENT_KEY);
            
            if (!isValid) {
                console.error('⚠️ Firma inválida - Evento rechazado');
                return res.status(401).json({ 
                    error: 'Firma inválida', 
                    message: 'El evento no pudo ser verificado' 
                });
            }

            console.log('✅ Firma verificada correctamente');

            // ✅ PASO 2: Procesar según el tipo de evento
            if (eventType === 'transaction.updated') {
                await handleTransactionUpdate(data.transaction);
            }
            // Puedes agregar más tipos de eventos aquí en el futuro

            // ✅ PASO 3: Responder con 200 para confirmar recepción
            return res.status(200).json({ 
                message: 'Webhook procesado correctamente',
                event: eventType 
            });
            
        } catch (error) {
            console.error('❌ Error procesando webhook:', error.message);
            // Aún así retornamos 200 para evitar reintentos innecesarios
            return res.status(200).json({ 
                message: 'Webhook recibido con errores', 
                error: error.message 
            });
        }
    }
};

// 🔐 Función para verificar la firma SHA256 del evento
function verifyEventSignature(event, secret) {
    try {
        const { data, signature, timestamp } = event;
        const { properties, checksum } = signature;

        // Paso 1: Concatenar valores de las propiedades especificadas
        let concatenatedString = '';
        
        properties.forEach(property => {
            const keys = property.split('.');
            let value = data;
            
            // Navegar por el objeto para obtener el valor
            keys.forEach(key => {
                value = value[key];
            });
            
            concatenatedString += value;
        });

        // Paso 2: Agregar timestamp
        concatenatedString += timestamp;

        // Paso 3: Agregar el secreto
        concatenatedString += secret;

        // Paso 4: Calcular SHA256
        const calculatedChecksum = crypto
            .createHash('sha256')
            .update(concatenatedString)
            .digest('hex')
            .toUpperCase();

        console.log('🔍 Verificación de firma:');
        console.log('   Checksum recibido:', checksum);
        console.log('   Checksum calculado:', calculatedChecksum);

        // Paso 5: Comparar
        return calculatedChecksum === checksum;
        
    } catch (error) {
        console.error('Error verificando firma:', error.message);
        return false;
    }
}

// 📝 Función para manejar actualizaciones de transacciones
async function handleTransactionUpdate(transaction) {
    try {
        const {
            id,
            reference,
            status,
            amount_in_cents,
            payment_method_type,
            customer_email,
            currency
        } = transaction;

        console.log(`💳 Procesando transacción: ${id}`);
        console.log(`   Referencia: ${reference}`);
        console.log(`   Estado: ${status}`);
        console.log(`   Monto: ${amount_in_cents / 100} ${currency}`);

        // Mapear estados de Wompi a tu sistema
        const paymentStateMap = {
            'APPROVED': 'Pago',
            'DECLINED': 'Rechazado',
            'VOIDED': 'Rechazado',
            'ERROR': 'Error',
            'PENDING': 'Pendiente'
        };

        const payment_state = paymentStateMap[status] || 'Pendiente';

        // Buscar el pago por transaction_id o por reference
        let payment = await Payment.findOne({
            where: { transaction_id: id }
        });

        if (payment) {
            // Actualizar pago existente
            await payment.update({
                payment_state,
                status,
                payment_method_type,
                customer_email
            });
            console.log(`✅ Pago actualizado: ${payment.id_payment}`);
        } else {
            // Buscar OrderDetail por referencia para crear el pago
            const orderDetail = await OrderDetail.findOne({
                where: { reference }
            });

            if (orderDetail) {
                payment = await Payment.create({
                    transaction_id: id,
                    reference,
                    amount_in_cents,
                    payment_method_type,
                    customer_email,
                    currency,
                    status,
                    payment_state,
                    id_orderDetail: orderDetail.id_orderDetail
                });
                console.log(`✅ Pago creado: ${payment.id_payment}`);
            } else {
                console.warn(`⚠️ No se encontró OrderDetail con referencia: ${reference}`);
            }
        }

        return payment;
        
    } catch (error) {
        console.error('Error actualizando pago:', error.message);
        throw error;
    }
}

module.exports = wompiController;


