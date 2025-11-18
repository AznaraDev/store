# 📋 Configuración del Webhook de Wompi

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener configurada la siguiente variable en tu archivo `.env`:

```env
# Secreto de eventos de Wompi (diferente para Sandbox y Producción)
EVENTS_SECRET_KEY=prod_events_TuSecretoAquí
```

**Importante:** 
- Para **Sandbox**: usa el secreto que comienza con `test_events_`
- Para **Producción**: usa el secreto que comienza con `prod_events_`

Puedes obtener este secreto desde el [Dashboard de Wompi](https://comercios.wompi.co/) en:
`Mi cuenta > Secretos para integración técnica`

### 2. Configurar URL de Eventos en Wompi

1. Ingresa al [Dashboard de Comercios de Wompi](https://comercios.wompi.co/)
2. Ve a la sección de configuración
3. Agrega tu URL de eventos:
   - **Desarrollo local**: `https://tu-ngrok-url.ngrok.io/eventos`
   - **Producción**: `https://tu-dominio.com/eventos`

**⚠️ Importante:** Usa HTTPS para mayor seguridad.

## 📊 Modelo de Base de Datos Actualizado

### Payment
El modelo `Payment` ahora incluye los siguientes campos para almacenar información de Wompi:

```javascript
{
  id_payment: INTEGER (PK),
  payment_state: ENUM('Pago', 'Pendiente', 'Rechazado', 'Error'),
  transaction_id: STRING (único),
  reference: STRING,
  amount_in_cents: INTEGER,
  payment_method_type: STRING,
  status: STRING,
  currency: STRING,
  customer_email: STRING,
  id_orderDetail: UUID (FK)
}
```

### OrderDetail
Se agregó el campo `reference` para relacionar con las transacciones de Wompi:

```javascript
{
  ...campos existentes,
  reference: STRING (único) // Referencia de Wompi
}
```

## 🔄 Flujo del Webhook

1. **Wompi envía evento** → POST a `/eventos`
2. **Verificación de firma SHA256** → Valida autenticidad
3. **Procesamiento del evento** → Actualiza/crea Payment
4. **Respuesta 200** → Confirma recepción

## 🔐 Seguridad

El webhook implementa verificación de firma SHA256 según la documentación de Wompi:

1. Concatena valores de las propiedades especificadas
2. Agrega el timestamp
3. Agrega el secreto
4. Calcula SHA256
5. Compara con el checksum recibido

## 📡 Endpoints Disponibles

### Webhook
- `POST /eventos` - Recibe eventos de Wompi (público)

### Pagos (requieren autenticación)
- `GET /payment` - Obtener todos los pagos
- `GET /payment/:id` - Obtener un pago específico
- `GET /payment/status/:status` - Filtrar por estado (Pago, Pendiente, Rechazado, Error)
- `GET /payment/order/:orderDetailId` - Obtener pagos de un pedido específico

## 🧪 Pruebas en Sandbox

Para probar el webhook en desarrollo local:

1. Instala [ngrok](https://ngrok.com/): `npm install -g ngrok`
2. Ejecuta tu servidor local: `npm run dev`
3. En otra terminal, ejecuta: `ngrok http 3001`
4. Copia la URL HTTPS generada
5. Configúrala en el Dashboard de Wompi (Sandbox)

## 📝 Tipos de Eventos Soportados

Actualmente el webhook maneja:

- `transaction.updated` - Cambios en el estado de transacciones

Puedes agregar más tipos de eventos modificando el archivo `src/controllers/webhook.js`

## 🔍 Logs

El webhook genera logs detallados en la consola:

```
📨 Webhook recibido - Tipo: transaction.updated - Ambiente: prod
🔍 Verificación de firma:
   Checksum recibido: 3476DDA...
   Checksum calculado: 3476DDA...
✅ Firma verificada correctamente
💳 Procesando transacción: 1234-1610641025-49201
   Referencia: MZQ3X2DE2SMX
   Estado: APPROVED
   Monto: 44900 COP
✅ Pago actualizado: 123
```

## ⚠️ Importante

- Wompi reintentará el webhook hasta 3 veces en 24 horas si no recibe respuesta 200
- Siempre valida la firma del evento antes de procesar
- Usa diferentes URLs de eventos para Sandbox y Producción
- El secreto de eventos es diferente de tu Llave Privada/Pública

## 🆘 Troubleshooting

### El webhook no se está llamando
- Verifica que la URL en Wompi sea correcta y accesible
- Asegúrate de usar HTTPS
- Revisa que el servidor esté corriendo

### Firma inválida
- Verifica que `EVENTS_SECRET_KEY` esté correctamente configurada
- Asegúrate de usar el secreto correcto (test vs prod)
- Revisa los logs para ver el checksum recibido vs calculado

### No se actualiza el pago
- Verifica que el `reference` en OrderDetail coincida con el de Wompi
- Revisa los logs para identificar errores específicos
