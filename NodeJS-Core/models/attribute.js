'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Attribute.hasMany(models.ProductAttributeValue,{
        foreignKey: "attribute_id",
        as: "productAttributeValues",
      })
    }
  }
  Attribute.init({
    name: DataTypes.STRING //vdu cpu,ram
  }, {
    sequelize,
    modelName: 'Attribute',
  });
  return Attribute;
};