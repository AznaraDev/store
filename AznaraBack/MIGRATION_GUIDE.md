# Guía de Migración de Productos

## 📋 Objetivo
Migrar productos que tienen múltiples colores a productos individuales (un color por producto).

### Formato Antiguo ❌
```json
{
  "name": "Reloj Elegante",
  "colors": ["Dorado", "Plateado", "Negro"],
  "images": ["img1.jpg", "img2.jpg", "img3.jpg"]
}
```

### Formato Nuevo ✅
```json
// Producto 1
{
  "name": "Reloj Elegante",
  "colors": ["Dorado"],
  "images": ["img1.jpg"]
}

// Producto 2
{
  "name": "Reloj Elegante",
  "colors": ["Plateado"],
  "images": ["img2.jpg"]
}

// Producto 3
{
  "name": "Reloj Elegante",
  "colors": ["Negro"],
  "images": ["img3.jpg"]
}
```

---

## 🚀 Pasos para Migrar

### Opción 1: Migrar Base de Datos Local

```bash
# 1. Ejecutar el script de análisis (modo dry-run)
cd AznaraBack
node src/utils/migrateProductsOneColorPerProduct.js
```

Esto mostrará:
- Cuántos productos tienen múltiples colores
- Plan de migración detallado
- Archivo de backup que se creará

```bash
# 2. Para ejecutar la migración real:
# Editar el archivo src/utils/migrateProductsOneColorPerProduct.js
# Descomentar la sección "EJECUTAR MIGRACIÓN" (líneas 96-171)

# 3. Volver a ejecutar
node src/utils/migrateProductsOneColorPerProduct.js
```

---

### Opción 2: Descargar desde Producción

```bash
# 1. Crear script temporal para descargar
node -e "
const { downloadProductsFromProduction } = require('./src/utils/migrateProductsOneColorPerProduct');

const PRODUCTION_URL = 'https://tu-api-produccion.com';
const AUTH_TOKEN = 'tu-token-admin';

downloadProductsFromProduction(PRODUCTION_URL, AUTH_TOKEN);
"
```

```bash
# 2. Analizar productos descargados
node -e "
const { analyzeDownloadedProducts } = require('./src/utils/migrateProductsOneColorPerProduct');

analyzeDownloadedProducts('./backups/production_products_TIMESTAMP.json');
"
```

---

## 📂 Archivos Generados

El script crea automáticamente:

```
AznaraBack/
├── backups/
│   ├── products_backup_2025-11-18T10-30-00.json    # Backup antes de migrar
│   ├── migration_log_2025-11-18T10-30-00.json      # Log de migración
│   └── production_products_2025-11-18T10-30-00.json # Descarga de producción
```

### Estructura del Backup
```json
[
  {
    "id_product": "uuid-123",
    "name": "Producto Original",
    "colors": ["Color1", "Color2", "Color3"],
    "images": ["url1", "url2", "url3"],
    "stock": 30,
    "price": 50000,
    // ... resto de campos
  }
]
```

### Estructura del Migration Log
```json
[
  {
    "original_id": "uuid-123",
    "original_name": "Producto Original",
    "new_id": "uuid-456",
    "new_name": "Producto Original",
    "color": "Color1",
    "images": ["url1"]
  },
  {
    "original_id": "uuid-123",
    "original_name": "Producto Original",
    "new_id": "uuid-789",
    "new_name": "Producto Original",
    "color": "Color2",
    "images": ["url2"]
  }
]
```

---

## ⚠️ IMPORTANTE - Antes de Ejecutar

### 1. **Backup de Base de Datos**
```bash
# PostgreSQL
pg_dump -U usuario -d nombre_base > backup_pre_migracion.sql
```

### 2. **Verificar Conexión**
- Asegúrate de que el script apunta a la base de datos correcta
- Revisa las variables de entorno en `.env`

### 3. **Modo Dry-Run Primero**
- Ejecuta el script SIN descomentar la sección de migración
- Revisa el plan de migración
- Verifica los productos que se van a migrar

### 4. **Probar en Local/Dev Primero**
- NO ejecutar directamente en producción
- Probar en ambiente de desarrollo
- Verificar resultados antes de aplicar a producción

---

## 🔍 Verificación Post-Migración

```bash
# Contar productos antes
SELECT COUNT(*) FROM "Products" WHERE "deletedAt" IS NULL;

# Contar productos después
SELECT COUNT(*) FROM "Products" WHERE "deletedAt" IS NULL;

# Ver productos con múltiples colores (debería ser 0)
SELECT name, colors FROM "Products" 
WHERE "deletedAt" IS NULL 
AND ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(BOTH '[]' FROM colors::text), ','), 1) > 1;
```

---

## 🔄 Rollback (En caso de error)

### Opción 1: Restaurar desde Backup SQL
```bash
psql -U usuario -d nombre_base < backup_pre_migracion.sql
```

### Opción 2: Script de Rollback Manual
```javascript
// Crear script: rollback.js
const { Product } = require('./src/data');
const fs = require('fs').promises;

async function rollback() {
  const backupData = JSON.parse(
    await fs.readFile('./backups/products_backup_TIMESTAMP.json', 'utf-8')
  );
  
  // Restaurar productos originales
  for (const product of backupData) {
    await Product.restore({ where: { id_product: product.id_product } });
  }
  
  // Eliminar productos migrados (leer de migration_log)
  const migrationLog = JSON.parse(
    await fs.readFile('./backups/migration_log_TIMESTAMP.json', 'utf-8')
  );
  
  for (const entry of migrationLog) {
    await Product.destroy({ where: { id_product: entry.new_id }, force: true });
  }
}
```

---

## 📊 Distribución de Imágenes

El script distribuye las imágenes equitativamente:

**Ejemplo:**
- Producto original: 6 imágenes, 3 colores
- Resultado: 2 imágenes por producto (6 ÷ 3 = 2)

**Si no son divisibles:**
- Producto original: 7 imágenes, 3 colores
- Resultado: 3, 2, 2 imágenes (se redondea hacia arriba para el primero)

---

## 🛠️ Personalización

### Cambiar distribución de imágenes
Editar línea 119 en `migrateProductsOneColorPerProduct.js`:
```javascript
// Actual: Distribuir equitativamente
const imagesPerColor = Math.ceil(images.length / colors.length);

// Opción: Primera imagen para todos
const colorImages = i === 0 ? images : [images[0]];

// Opción: Todas las imágenes para todos
const colorImages = images;
```

### Cambiar distribución de stock
Editar línea 130:
```javascript
// Actual: Dividir stock
stock: Math.floor(product.stock / colors.length)

// Opción: Mantener stock original
stock: product.stock
```

---

## 📞 Soporte

Si encuentras errores durante la migración:

1. **NO** ejecutes el script nuevamente
2. Revisa los archivos de backup en `./backups/`
3. Revisa los logs del script
4. Contacta al equipo de desarrollo

---

## ✅ Checklist

- [ ] Backup de base de datos creado
- [ ] Script ejecutado en modo dry-run
- [ ] Plan de migración revisado
- [ ] Conexión a base de datos verificada
- [ ] Backup automático del script creado
- [ ] Migración ejecutada en desarrollo
- [ ] Resultados verificados
- [ ] Productos migrados correctamente
- [ ] Stock actualizado
- [ ] Imágenes correctamente asignadas
- [ ] Sin productos con múltiples colores
- [ ] Aplicar a producción (si todo OK)
