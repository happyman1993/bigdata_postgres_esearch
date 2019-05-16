'use strict';
module.exports = (sequelize, DataTypes) => {
  const city = sequelize.define('city', {
    name: DataTypes.STRING,
    state_id: DataTypes.INTEGER
  }, {});
  city.associate = function(models) {
    city.belongsTo(models.state, {
      foreignKey: 'state_id'
    });
  };
  return city;
};