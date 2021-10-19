const { getDb } = require('./database');
const { ObjectId } = require('mongodb');
module.exports = class Product {
  constructor(title, price, description, imageUrl = 'product.png', _id,userId) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this._id =  _id ? new ObjectId(_id ) : undefined;
    this.userId = userId;
  }
  save() {
    let dbOp;
    if (this._id) {
      //UPDATE
      dbOp = getDb()
        .collection('products')
        .updateOne({ _id: new ObjectId(this._id) }, { $set: this });
    } else {
      // SAVE
      dbOp = getDb().collection('products').insertOne(this);
    }
    return dbOp

  }

  static fetchAll() {
    return getDb()
      .collection('products')
      .find()
      .toArray();
  }

  static findById(id) {
    return getDb()
      .collection('products')
      .find({ _id: new ObjectId(id) })
      .next();
  }

  static deleteById(id) {
    return getDb()
      .collection('products')
      .deleteOne({ _id: new ObjectId(id) })
  }
};
