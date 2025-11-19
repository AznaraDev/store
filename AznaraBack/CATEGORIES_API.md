# API de Categorías y Subcategorías

## 📋 Endpoints

### Categorías

#### 1. Obtener todas las categorías
```http
GET /category
```
**Público** - No requiere autenticación

**Response:**
```json
{
  "categories": [
    {
      "id_category": "uuid",
      "name": "Relojes",
      "section": "Caballero",
      "SubCategories": [
        {
          "id_subCategory": "uuid",
          "name": "Deportivos"
        }
      ]
    }
  ]
}
```

---

#### 2. Crear categoría
```http
POST /category/createCategory
Authorization: Bearer <token>
Role: Admin
```

**Body:**
```json
{
  "name": "Relojes",
  "section": "Caballero"
}
```

**Response:**
```json
{
  "message": "Categoría creada exitosamente",
  "category": {
    "id_category": "uuid",
    "name": "Relojes",
    "section": "Caballero"
  }
}
```

**Errores:**
- `400`: Ya existe una categoría con ese nombre
- `401`: No autenticado
- `403`: No autorizado (no Admin)

---

#### 3. Actualizar categoría
```http
PUT /category/:id
Authorization: Bearer <token>
Role: Admin
```

**Body:**
```json
{
  "name": "Relojes Elegantes",
  "section": "Unisex"
}
```

**Response:**
```json
{
  "message": "Categoría actualizada exitosamente",
  "category": {
    "id_category": "uuid",
    "name": "Relojes Elegantes",
    "section": "Unisex"
  }
}
```

**Errores:**
- `400`: Nombre duplicado
- `404`: Categoría no encontrada

---

#### 4. Eliminar categoría
```http
DELETE /category/:id
Authorization: Bearer <token>
Role: Admin
```

**Response:**
```json
{
  "message": "Categoría \"Relojes\" eliminada exitosamente"
}
```

**Errores:**
- `400`: No se puede eliminar si tiene subcategorías asociadas
- `400`: No se puede eliminar si tiene productos asociados
- `404`: Categoría no encontrada

**Ejemplo de error:**
```json
{
  "error": "No se puede eliminar la categoría \"Relojes\" porque tiene 4 subcategoría(s) asociada(s)",
  "subCategoriesCount": 4
}
```

---

### Subcategorías

#### 5. Obtener todas las subcategorías
```http
GET /category/subcategory?categoryId=<uuid>
```
**Público** - No requiere autenticación

**Query Params:**
- `categoryId` (opcional): Filtrar por categoría

**Response:**
```json
{
  "subCategories": [
    {
      "id_subCategory": "uuid",
      "name": "Deportivos",
      "categoryId": "uuid",
      "category": {
        "id_category": "uuid",
        "name": "Relojes",
        "section": "Caballero"
      }
    }
  ],
  "count": 1
}
```

---

#### 6. Crear subcategoría
```http
POST /category/subcategory
Authorization: Bearer <token>
Role: Admin
```

**Body:**
```json
{
  "name": "Deportivos",
  "categoryId": "uuid-de-categoria"
}
```

**Response:**
```json
{
  "message": "Subcategoría creada exitosamente",
  "subCategory": {
    "id_subCategory": "uuid",
    "name": "Deportivos",
    "categoryId": "uuid"
  }
}
```

**Errores:**
- `400`: Falta name o categoryId
- `400`: Ya existe una subcategoría con ese nombre en esta categoría

---

#### 7. Actualizar subcategoría
```http
PUT /category/subcategory/:id
Authorization: Bearer <token>
Role: Admin
```

**Body:**
```json
{
  "name": "Deportivos Premium",
  "categoryId": "uuid-otra-categoria" // opcional
}
```

**Response:**
```json
{
  "message": "Subcategoría actualizada exitosamente",
  "subCategory": {
    "id_subCategory": "uuid",
    "name": "Deportivos Premium",
    "categoryId": "uuid"
  }
}
```

**Errores:**
- `400`: Nombre duplicado en la categoría
- `404`: Subcategoría no encontrada

---

#### 8. Eliminar subcategoría
```http
DELETE /category/subcategory/:id
Authorization: Bearer <token>
Role: Admin
```

**Response:**
```json
{
  "message": "Subcategoría \"Deportivos\" eliminada exitosamente"
}
```

**Errores:**
- `400`: No se puede eliminar si tiene productos asociados
- `404`: Subcategoría no encontrada

**Ejemplo de error:**
```json
{
  "error": "No se puede eliminar la subcategoría \"Deportivos\" porque tiene 12 producto(s) asociado(s)",
  "productsCount": 12
}
```

---

## 🔒 Seguridad

### Endpoints Públicos:
- `GET /category` - Ver categorías
- `GET /category/subcategory` - Ver subcategorías

### Endpoints Admin (requieren token + role Admin):
- `POST /category/createCategory` - Crear categoría
- `PUT /category/:id` - Actualizar categoría
- `DELETE /category/:id` - Eliminar categoría
- `POST /category/subcategory` - Crear subcategoría
- `PUT /category/subcategory/:id` - Actualizar subcategoría
- `DELETE /category/subcategory/:id` - Eliminar subcategoría

---

## ✅ Validaciones

### Al eliminar Categoría:
1. ❌ No permite si tiene subcategorías asociadas
2. ❌ No permite si tiene productos asociados
3. ✅ Permite solo si no tiene dependencias

### Al eliminar Subcategoría:
1. ❌ No permite si tiene productos asociados
2. ✅ Permite solo si no tiene dependencias

### Al crear/actualizar:
- Validación de nombres duplicados
- Campos requeridos

---

## 📊 Ejemplos de Uso

### Flujo completo:

```javascript
// 1. Crear categoría
POST /category/createCategory
{
  "name": "Relojes",
  "section": "Caballero"
}

// 2. Crear subcategorías
POST /category/subcategory
{ "name": "Deportivos", "categoryId": "uuid-relojes" }

POST /category/subcategory
{ "name": "Elegantes", "categoryId": "uuid-relojes" }

// 3. Actualizar categoría
PUT /category/uuid-relojes
{ "name": "Relojes Premium" }

// 4. Intentar eliminar categoría (fallará si tiene subcategorías)
DELETE /category/uuid-relojes
// Error: tiene 2 subcategorías asociadas

// 5. Eliminar subcategorías primero
DELETE /category/subcategory/uuid-deportivos
DELETE /category/subcategory/uuid-elegantes

// 6. Ahora sí eliminar categoría
DELETE /category/uuid-relojes
// Success
```

---

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Validación fallida o dependencias |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - No autorizado (no Admin) |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 🧪 Testing

### Con curl:

```bash
# Obtener categorías
curl http://localhost:3001/category

# Crear categoría (necesita token)
curl -X POST http://localhost:3001/category/createCategory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Relojes","section":"Caballero"}'

# Actualizar categoría
curl -X PUT http://localhost:3001/category/UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Relojes Premium"}'

# Eliminar categoría
curl -X DELETE http://localhost:3001/category/UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Con Postman/Thunder Client:

1. Crear colección "Categories CRUD"
2. Agregar los 8 endpoints
3. Configurar Authorization en folder level
4. Usar variables para base_url y tokens

---

## 📝 Notas Importantes

1. **Soft Delete**: Las eliminaciones son soft delete (paranoid: true)
2. **Cascada**: No hay cascada automática - debes eliminar hijos primero
3. **Validaciones**: El backend valida dependencias antes de eliminar
4. **Orden**: Siempre eliminar en orden: Productos → Subcategorías → Categorías
5. **Nombres**: Los nombres de categorías son únicos globalmente
6. **Nombres SC**: Los nombres de subcategorías son únicos por categoría
