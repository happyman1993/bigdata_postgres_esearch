'use strict';
module.exports = (sequelize, DataTypes) => {
  const country = sequelize.define('country', {
    name: DataTypes.STRING
  }, {});
  country.associate = function(models) {
    country.hasMany(models.state, {
      foreignKey: 'country_id',
      as: 'states'
    });
  };
  return country;
};