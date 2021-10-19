const {DataTypes} = require('sequelize');
const seqeulize = require('../../data/database');

const Order = seqeulize.define('order' ,{
    id : {
        type : DataTypes.INTEGER,
        allowNull : false,
        primaryKey : true ,
        autoIncrement : true
    }
})

module.exports = Order;