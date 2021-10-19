const { DataTypes } = require('sequelize');
const seqeulize = require('../../data/database');

const OrderItem = seqeulize.define('orderItem', {
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

module.exports = OrderItem;
