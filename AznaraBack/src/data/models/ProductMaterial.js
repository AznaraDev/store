const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "ProductMaterial",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_product: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id_product'
        }
      },
      id_material: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Materials',
          key: 'id_material'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'ProductMaterials'
    }
  );
};
