const jwt = require("jsonwebtoken");
const response = require("../../utils/response");

const authenticate = (req, res, next) => {
  console.log('🔐 Middleware authenticate - Headers:', req.headers.authorization ? 'Token presente' : 'Token ausente');
  
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log('❌ No hay header Authorization');
    return response(res, 401, "Acceso denegado. No se proporcionó un token.");
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.log('❌ Token vacío después de remover Bearer');
    return response(res, 401, "Acceso denegado. No se proporcionó un token.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    console.log('✅ Usuario autenticado:', decoded.role);
    next();
  } catch (error) {
    console.log('❌ Error verificando token:', error.message);
    response(res, 400, "Token no válido.");
  }
};

const authorize = (roles) => (req, res, next) => {
  console.log('🔒 Middleware authorize - Usuario role:', req.user?.role, '- Roles permitidos:', roles);
  if (!roles.includes(req.user.role)) {
    console.log('❌ Acceso denegado - rol no autorizado');
    return response(res, 403, "No tienes permiso para realizar esta acción.");
  }
  console.log('✅ Autorización exitosa');
  next();
};

module.exports = {
  authenticate,
  authorize
};

