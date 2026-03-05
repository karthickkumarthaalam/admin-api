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

    await queryInterface.addColumn("crew_flights", "departure_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_flights", "arrival_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.changeColumn("crew_flights", "departure_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.changeColumn("crew_flights", "arrival_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_rooms", "checkin_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_rooms", "checkout_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.changeColumn("crew_rooms", "checkin_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.changeColumn("crew_rooms", "checkout_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_flights", "currency", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_flights", "ticket_charge", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_visas", "currency", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_visas", "visa_charge", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_rooms", "currency", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_rooms", "room_charge", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("crew_flights", "departure_date");

    await queryInterface.removeColumn("crew_flights", "arrival_date");

    await queryInterface.changeColumn("crew_flights", "departure_time", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn("crew_flights", "arrival_time", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.removeColumn("crew_rooms", "checkin_time");

    await queryInterface.removeColumn("crew_rooms", "checkout_time");

    await queryInterface.changeColumn("crew_rooms", "checkin_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn("crew_rooms", "checkout_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.removeColumn("crew_flights", "currency");
    await queryInterface.removeColumn("crew_flights", "ticket_charge");

    await queryInterface.removeColumn("crew_visas", "currency");
    await queryInterface.removeColumn("crew_visas", "visa_charge");

    await queryInterface.removeColumn("crew_rooms", "currency");
    await queryInterface.removeColumn("crew_rooms", "room_charge");
  },
};
