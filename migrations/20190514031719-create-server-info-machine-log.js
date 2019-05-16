'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('server_info_machine_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      server_id: {
        type: Sequelize.INTEGER
      },
      client_tcp: {
        type: Sequelize.INTEGER
      },
      client_udp: {
        type: Sequelize.INTEGER
      },
      download_per_second: {
        type: Sequelize.INTEGER
      },
      upload_per_second: {
        type: Sequelize.INTEGER
      },
      total_download:{
        type: Sequelize.INTEGER
      },
      total_upload:{
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('server_info_machine_logs');
  }
};