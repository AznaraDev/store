const { User, Subscription } = require("../../data");
const response = require("../../utils/response");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    const user = req.body;

    // Validar campos obligatorios
    if (!user.first_name || !user.last_name || !user.email || !user.password || !user.n_document) {
      return response(res, 400, "Todos los campos son obligatorios");
    }

    // Verificar si el email ya está registrado en la tabla User
    const existingEmail = await User.findOne({ where: { email: user.email } });
    if (existingEmail) {
      return response(res, 400, "El email ya está registrado. Por favor, utilice otro email.");
    }

    // Verificar si el número de documento ya está registrado
    const existingDocument = await User.findOne({ where: { n_document: user.n_document } });
    if (existingDocument) {
      return response(res, 400, "El número de documento ya está registrado.");
    }

    // Verificar si el email está en la tabla Subscription
    const subscription = await Subscription.findOne({ where: { email: user.email } });
    const isSubscribed = !!subscription; // Determinar si el usuario estará suscrito

    // Encriptar contraseña
    const hash = await bcrypt.hash(user.password, 10);

    // Crear el nuevo usuario
    const newUser = await User.create({
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender[0], // Si 'gender' es un array, toma el primer elemento
      n_document: user.n_document,
      email: user.email,
      password: hash,
      phone: user.phone,
      city: user.city,
      role: user.role,
      isSubscribed,
    });

    // Si estaba en la tabla de suscripciones, eliminar el registro
    if (isSubscribed) {
      await subscription.destroy();
    }

    // Crear un token de autenticación
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    response(res, 201, { message: "Usuario creado con éxito", token });
  } catch (error) {
    console.error(error);
    response(res, 500, "Error al crear el usuario");
  }
};
