'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('products', 'name', {
      type: Sequelize.STRING,
      allowNull: false,   
      unique: true        
    });
  },

  async down(queryInterface, Sequelize) {
    // rollback: cho phép null và bỏ unique
    await queryInterface.changeColumn('products', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  }
};
