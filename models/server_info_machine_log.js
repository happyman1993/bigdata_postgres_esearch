'use strict';
module.exports = (sequelize, DataTypes) => {
  const server_info_machine_log = sequelize.define('server_info_machine_log', {
    server_id: DataTypes.INTEGER,
    download_per_second: DataTypes.INTEGER,
    upload_per_second: DataTypes.INTEGER,
    total_download: DataTypes.INTEGER,
    total_upload: DataTypes.INTEGER
  }, {});
  server_info_machine_log.associate = function(models) {
    // associations can be defined here
  };
  return server_info_machine_log;
};