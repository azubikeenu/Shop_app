const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

User.methods.addToCart = function (productId) {
  const productIndex = this.cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );
  if (productIndex !== -1) {
    //increment the quantity
    this.cart.items[productIndex].quantity =
      this.cart.items[productIndex].quantity + 1;
  } else {
    const quantity = 1;
    this.cart.items.push({ product: productId, quantity });
  }

  return this.save();
};

User.methods.deleteFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.product.toString() !== productId
  );
  return this.save();
};


module.exports = mongoose.model('User', User);
