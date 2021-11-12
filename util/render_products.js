const Product = require('../data/schema/product');

module.exports.renderProducts = async (req, next) => {
  const perPage = 2;
  const page = req.query.page * 1 || 1;
  try {
    const count = await Product.countDocuments();
    const products = await Product.find({})
      .skip(perPage * page - perPage)
      .limit(perPage);
    return { count, products, page, perPage };
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};
