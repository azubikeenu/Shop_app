const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'must have a title'],
  },
  price: {
    type: Number,
    required: [true, 'must have a price'],
  },
  imageUrl: {
    type: String,
    default: 'product.png',
  },
  description: {
    type: String,
    required: [true, 'must have a description'],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required : true
  },
});


module.exports = mongoose.model('Product', Product);
