"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductAttributeValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductAttributeValue.belongsTo(models.Product, { foreignKey: "product_id" , as: "product",});
      ProductAttributeValue.belongsTo(models.Attribute, { foreignKey: "attribute_id",as: "attribute", });
    }
  }
  ProductAttributeValue.init(
    {
      product_id: DataTypes.INTEGER,
      attribute_id: DataTypes.INTEGER,
      value: DataTypes.TEXT, // vdu core i7, 16gb, xanh
    },
    {
      sequelize,
      modelName: "ProductAttributeValue",
      tableName: "product_attribute_values",
    }
  );
  return ProductAttributeValue;
};
