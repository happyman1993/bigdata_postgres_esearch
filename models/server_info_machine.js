'use strict';
module.exports = (sequelize, DataTypes) => {
  const serverinfo_machine = sequelize.define('serverinfo_machine', {
    server_id: DataTypes.INTEGER,
    client_tcp: DataTypes.INTEGER,
    client_udp: DataTypes.INTEGER,
    cpu: DataTypes.STRING,
    memory_free: DataTypes.INTEGER,
    momory_use: DataTypes.INTEGER,
    download_per_seconds: DataTypes.INTEGER,
    upload_per_seconds: DataTypes.INTEGER,
    last_update: DataTypes.DATE
  }, {});
  serverinfo_machine.associate = function(models) {
  };
  return serverinfo_machine;
};