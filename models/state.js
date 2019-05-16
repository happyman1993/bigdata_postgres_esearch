'use strict';
module.exports = (sequelize, DataTypes) => {
  const state = sequelize.define('state', {
    name: DataTypes.STRING,
    country_id: DataTypes.INTEGER
  }, {});
  state.associate = function(models) {
    state.belongsTo(models.country, {
      foreignKey: 'country_id'
    });
    state.hasMany(models.city, {
      foreignKey: 'state_id',
      as: 'cities'
    });
  };
  return state;
};