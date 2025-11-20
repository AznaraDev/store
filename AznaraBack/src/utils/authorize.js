const authorize = (roles = []) => {
  return (req, res, next) => {
    console.log('✅ Autorización exitosa');
    console.log('User role:', req.user.role);
    console.log('Required roles:', roles);
    
    // Comparación case-insensitive
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Acceso denegado - rol no autorizado');
      return res.status(403).json({ error: true, message: "Access denied" });
    }
    
    console.log('✅ Usuario autorizado');
    next();
  };
};

module.exports = authorize;
