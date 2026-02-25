"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("crew_management", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      crew_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable("crew_management_list", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      crew_management_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      given_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sur_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: true,
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      passport_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_of_issue: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      date_of_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      passport_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      visa_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      visa_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      visa_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      visa_issue: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      visa_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      food_preference: {
        type: Sequelize.ENUM(
          "veg",
          "non_veg",
          "vegan",
          "jain",
          "halal",
          "eggitarian",
          "custom",
        ),
        allowNull: true,
      },
      flight_class: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      room_preference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "in-active"),
        defaultValue: "in-active",
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable("crew_rooms", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      crew_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management_list",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      hotel_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      room_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      room_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      checkin_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      checkout_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable("crew_flights", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      crew_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management_list",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      from_city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      to_city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      flight_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      airline: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      departure_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      arrival_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      terminal: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ticket_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pnr: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ticket_file: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ticket_issued_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      booking_status: {
        type: Sequelize.ENUM("pending", "booked", "cancelled"),
        defaultValue: "pending",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("crew_flights");
    await queryInterface.dropTable("crew_rooms");
    await queryInterface.dropTable("crew_management_list");
    await queryInterface.dropTable("crew_management");
  },
};
