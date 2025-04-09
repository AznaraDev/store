// Controller para manejar suscripciones
const { User, Subscription } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return response(res, 400, "El email es obligatorio.");
    }

    // Buscar en usuarios registrados
    const user = await User.findOne({ where: { email } });

    if (user) {
      // Actualizar su suscripción
      await user.update({ isSubscribed: true });
      return response(res, 200, "Usuario suscrito con éxito.");
    }

    // Si no está registrado, agregarlo a la tabla de suscripciones
    const subscription = await Subscription.findOrCreate({ where: { email } });

    return response(res, 200, "Suscripción completada. Por favor, regístrate para completar tu perfil.");
  } catch (error) {
    console.error("Error en suscripción:", error);
    return response(res, 500, "Error al procesar la suscripción.");
  }
};