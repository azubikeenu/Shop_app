const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
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

User.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

User.methods.comparePasswords = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

User.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 10 * 1000; // set the expiration time to 10 minutes
  return token;
};

module.exports = mongoose.model('User', User);
