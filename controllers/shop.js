const { cropText } = require('../util/helpers');
const ProductModel = require('../data/schema/product');
const OrderModel = require('../data/schema/order');
const UserModel = require('../data/schema/user');

module.exports.getProducts = (req, res, next) => {
  ProductModel.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        title: 'All Products',
        path: '/products',
        cropText,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

module.exports.getIndexPage = (req, res, next) => {
  ProductModel.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        title: 'Shop',
        path: '/',
        cropText,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

module.exports.showCart = async (req, res, next) => {
  const products = [];
  const { cart } = await UserModel.findById(req.session.user).populate(
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
    isAuthenticated: req.session.isLoggedIn,
  });
};

module.exports.getProduct = (req, res, next) => {
  const { id } = req.params;
  ProductModel.findById(id)
    .then((product) => {
      res.status(200).render('shop/product-detail', {
        title: `${product.title}`,
        path: '/products',
        product: product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

module.exports.postCart = (req, res, next) => {

  const { id } = req.body;
  req.user
    .addToCart(id)
    .then(res.redirect('cart/'))
    .catch((err) => console.log(err));
};

module.exports.deleteCartItem = (req, res, next) => {
  const id = req.body.productId;

  req.user
    .deleteFromCart(id)
    .then(() => {
      console.log('Item deleted from cart');
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

module.exports.postOrder = async (req, res, next) => {
  const { cart } = await UserModel.findById(req.session.user).populate(
    'cart.items.product'
  );
  const products = cart.items.map(({ product, quantity }) => {
    return { product: { ...product.toJSON() }, quantity };
  });
  const user = {
    name: req.session.user.name,
    userId: req.session.user._id,
  };
  OrderModel.create({ products, user })
    .then(async () => {
      req.session.user.cart.items = [];
      await req.session.user.save();
      res.redirect('/orders');
    })
    .catch((err) => console.log(err));
};

module.exports.getOrders = (req, res, next) => {
  OrderModel.find({ 'user.userId': req.session.user._id })
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
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};
