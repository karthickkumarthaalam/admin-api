module.exports = (sequelize, DataTypes) => {
  const Advertisement = sequelize.define("Advertisement", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_person: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requirement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "intimated", "in-progress", "closed"),
      defaultValue: "pending",
    },
  });

  return Advertisement;
};
