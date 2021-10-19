const { DataTypes } = require('sequelize');
const seqeulize = require('../../data/database');

const CartItem = seqeulize.define('cartItem', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
});

module.exports = CartItem;
