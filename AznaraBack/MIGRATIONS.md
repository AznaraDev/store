# 🔄 Guía de Migraciones de Base de Datos

## 📋 Prerequisitos

- Sequelize CLI instalado (ya incluido en devDependencies)
- Variables de entorno configuradas en `.env`
- Acceso a la base de datos de producción (Neon)

## 🛠️ Comandos Disponibles

### Local (Development)

```bash
# Ver estado de migraciones
npm run migrate:status

# Ejecutar todas las migraciones pendientes
npm run migrate

# Revertir la última migración
npm run migrate:undo
```

### Producción (Neon)

```bash
# Ver estado de migraciones en producción
npm run migrate:prod:status

# Ejecutar migraciones en producción
npm run migrate:prod
```

## 📝 Migraciones Creadas

### 1. `20250902000001-add-reference-to-orderdetails.js`
Agrega el campo `reference` a la tabla `OrderDetails` para relacionar con transacciones de Wompi.

**Campos agregados:**
- `reference` (STRING, único, nullable)

### 2. `20250902000002-update-payments-for-wompi.js`
Actualiza la tabla `Payments` para almacenar información completa de Wompi.

**Campos agregados:**
- `transaction_id` (STRING, único)
- `reference` (STRING)
- `amount_in_cents` (INTEGER)
- `payment_method_type` (STRING)
- `status` (STRING)
- `currency` (STRING, default: 'COP')
- `customer_email` (STRING)

**Estados agregados al ENUM `payment_state`:**
- `Rechazado`
- `Error`

## 🚀 Proceso de Migración en Producción

### Paso 1: Verificar Estado Actual

```bash
npm run migrate:prod:status
```

Deberías ver algo como:
```
down 20250902000001-add-reference-to-orderdetails.js
down 20250902000002-update-payments-for-wompi.js
```

### Paso 2: Ejecutar Migraciones

```bash
npm run migrate:prod
```

Verás logs como:
```
✅ Campo reference agregado a OrderDetails
✅ Nuevos estados agregados a payment_state ENUM
✅ Campo transaction_id agregado a Payments
✅ Campo reference agregado a Payments
...
```

### Paso 3: Verificar Ejecución

```bash
npm run migrate:prod:status
```

Ahora debería mostrar:
```
up 20250902000001-add-reference-to-orderdetails.js
up 20250902000002-update-payments-for-wompi.js
```

## ⚠️ Importante

### Base de Datos Local
En local puedes usar `force: true` en Sequelize para recrear las tablas:
```javascript
// En src/data/index.js
sequelize.sync({ force: true })
```

⚠️ **NUNCA uses `force: true` en producción** - Perderás todos los datos.

### Base de Datos de Producción (Neon)
Siempre usa migraciones para modificar la estructura sin perder datos.

## 🔍 Troubleshooting

### Error: "Relation already exists"
Si un campo ya existe, la migración lo omitirá automáticamente.

### Error: "Cannot add value to enum"
Si los valores del ENUM ya existen, PostgreSQL los omitirá automáticamente.

### Error de conexión
Verifica que `DB_DEPLOY` en `.env` tenga la URL correcta de Neon:
```
postgres://default:3ToEuStx0pUq@ep-round-frog-a4toyb2x-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require
```

## 📊 Estructura de Archivos

```
AznaraBack/
├── .sequelizerc              # Configuración de rutas de Sequelize CLI
├── src/
│   ├── config/
│   │   └── database.js       # Config de BD para migraciones
│   └── data/
│       ├── migrations/       # Carpeta de migraciones
│       │   ├── 20250902000001-add-reference-to-orderdetails.js
│       │   └── 20250902000002-update-payments-for-wompi.js
│       └── models/           # Modelos de Sequelize
```

## 🔐 Variables de Entorno Requeridas

```env
# Local
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Aznara

# Producción (Neon)
DB_DEPLOY=postgres://default:3ToEuStx0pUq@ep-round-frog-a4toyb2x-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require
```

## 📚 Crear Nuevas Migraciones

Para crear una nueva migración en el futuro:

```bash
npx sequelize-cli migration:generate --name nombre-descriptivo-del-cambio
```

Esto creará un archivo en `src/data/migrations/` que puedes editar.

## ✅ Checklist de Deployment

- [ ] Verificar que `.env` tenga `DB_DEPLOY` con la URL de Neon
- [ ] Ejecutar `npm run migrate:prod:status` para ver estado
- [ ] Ejecutar `npm run migrate:prod` para aplicar migraciones
- [ ] Verificar logs en consola (deben mostrar ✅)
- [ ] Confirmar con `npm run migrate:prod:status` que están aplicadas
- [ ] Hacer deploy del código actualizado
- [ ] Probar el webhook en producción

## 🆘 Rollback

Si necesitas revertir la última migración:

```bash
# Local
npm run migrate:undo

# Producción
NODE_ENV=production npm run migrate:undo
```

⚠️ Usa con precaución en producción.
