'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Sửa cột name: không cho null và unique
    await queryInterface.changeColumn('brands', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback về lại không ràng buộc
    await queryInterface.changeColumn('brands', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  }
};
