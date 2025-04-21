const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define(
      'Subscription',
      {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
              isEmail: true,
            },
          },
          isConfirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Confirmar si deseas algún paso adicional
          },
    },
    {
      paranoid: true,
    }
  );
};

