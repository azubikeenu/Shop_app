const { cropText } = require('../util/helpers');
const Product = require('../data/schema/product');
const Order = require('../data/schema/order');
const User = require('../data/schema/user');

module.exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      return res.render('shop/product-list', {
        prods: products,
        title: 'All Products',
        path: '/products',
        cropText,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.getIndexPage = (req, res, next) => {
  Product.find()
    .then((products) => {
      return res.render('shop/index', {
        prods: products,
        title: 'Shop',
        path: '/',
        cropText,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.showCart = async (req, res, next) => {
  const products = [];
  try {
    const { cart } = await User.findById(req.session.user).populate(
      'cart.items.product'
    );
    if (cart.items.length > 0) {
      for (const { product, quantity } of cart.items) {
        product.quantity = quantity;
        products.push(product);
      }
    }
    return res.status(200).render('shop/cart', {
      title: 'Your Cart',
      path: '/cart',
      products,
    });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

module.exports.getProduct = (req, res, next) => {
  const { id } = req.params;
  Product.findById(id)
    .then((product) => {
      res.status(200).render('shop/product-detail', {
        title: `${product.title}`,
        path: '/products',
        product: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.postCart = (req, res, next) => {
  const { id } = req.body;
  req.user
    .addToCart(id)
    .then(res.redirect('cart/'))
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.deleteCartItem = (req, res, next) => {
  const id = req.body.productId;

  req.user
    .deleteFromCart(id)
    .then(() => {
      console.log('Item deleted from cart');
      res.redirect('/cart');
    })
    .catch((err) => {});
};

module.exports.postOrder = async (req, res, next) => {
  const { cart } = await User.findById(req.session.user).populate(
    'cart.items.product'
  );
  const products = cart.items.map(({ product, quantity }) => {
    return { product: { ...product.toJSON() }, quantity };
  });
  const user = {
    email: req.user.email,
    userId: req.session.user._id,
  };
  console.log(req.session.user);
  Order.create({ products, user })
    .then(async () => {
      req.session.user.cart.items = [];
      await req.user.save();
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then((orders) => {
      // const fn = orders.map((order) => {
      //   return {
      //     order,
      //     totalPrice: order.products.reduce((total, curr) => {
      //       return total + curr.product.price;
      //     }, 0),
      //   };
      // });
      // console.log(fn);
      return res.status(200).render('shop/orders', {
        title: 'Your Cart',
        path: '/orders',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};
