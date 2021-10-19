const { getDb } = require('./database');
const { ObjectId } = require('mongodb');
const { getProduct } = require('../controllers/admin');
module.exports = class User {
  constructor(name, email, cart, id) {
    this.email = email;
    this.name = name;
    this.cart = cart ? cart : { items: [] }; // {items : [{{product} : quantity}] }
    this._id = id;
  }

  //db.users.updateOne({_id : ObjectId('615660853a8f47b5dc843dcb')}, {$set : {"cart.items" : []}});
  addToCart(id) {
    const db = getDb();
    const productId = new ObjectId(id);
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
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: this.cart } }
      );
  }

  deleteFromCart(productId) {
    const db = getDb();
    this.cart.items = this.cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    return db
      .collection('users')
      .updateOne({ _id: this._id }, { $set: { cart: this.cart } });
  }

  save() {
    return getDb().collection('users').insertOne(this);
  }

  static findById(id) {
    return getDb()
      .collection('users')
      .findOne({ _id: new ObjectId(id) });
  }

  async makeOrder() {
    const products = await this.getCart();
    const orders = {
      items: products,
      user: {
        _id: new ObjectId(this._id),
        email: this.email,
      },
    };
    await getDb().collection('orders').insertOne(orders);
    this.cart.items = [];
    await getDb()
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: this.cart } }
      );
  }

  getOrders() {
    return getDb()
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }

  getCart() {
    const productIds = this.cart.items.map((item) => item.product);
    return getDb()
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((item) => {
              return item.product.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }
};
