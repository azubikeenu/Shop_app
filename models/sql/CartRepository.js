const {DataTypes} = require('sequelize');
const seqeulize = require('../../data/database');

const Cart = seqeulize.define('cart' ,{
    id : {
        type : DataTypes.INTEGER,
        allowNull : false,
        primaryKey : true ,
        autoIncrement : true
    }
})

module.exports = Cart;