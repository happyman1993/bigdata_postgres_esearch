'use strict';
module.exports = (sequelize, DataTypes) => {
  const serverinfo = sequelize.define('serverinfo', {
    name: DataTypes.STRING,
    display_name: DataTypes.STRING,
    country: DataTypes.STRING,
    ip: DataTypes.STRING,
    nearest_ip: DataTypes.STRING,
    others: DataTypes.STRING,
    token: DataTypes.STRING,
    type: DataTypes.STRING,
    version: DataTypes.STRING,
    port_tcp: DataTypes.INTEGER,
    port_udp: DataTypes.INTEGER,
    monitoring: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    last_update: DataTypes.DATE
  }, {});
  serverinfo.associate = function(models) {
  };
  return serverinfo;
};