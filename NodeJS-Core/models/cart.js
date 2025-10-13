'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cart.hasMany(models.CartItem,{
        foreignKey: "cart_id",
      
      })
    }
  }
  Cart.init({
    session_id: {
    type: DataTypes.STRING,
    unique: true, // mỗi session chỉ có 1 cart
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true, // mỗi user chỉ có 1 cart
  }
  }, {
    sequelize,
    modelName: 'Cart',
  });
  return Cart;
};