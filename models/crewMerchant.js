module.exports = (sequelize, DataTypes) => {
  const CrewMerchant = sequelize.define(
    "CrewMerchant",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      merchant_type: {
        type: DataTypes.ENUM("flight", "room"),
        allowNull: false,
        defaultValue: "flight",
      },
      merchant_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      tableName: "crew_merchants",
      timestamps: true,
      paranoid: true,
    },
  );

  CrewMerchant.associate = (models) => {
    CrewMerchant.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
  };

  return CrewMerchant;
};
