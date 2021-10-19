const router = require('express').Router();

const {
  getProducts,
  showCart,
  getIndexPage,
  getCheckoutPage,
  getOrders,
  getProduct,
  postCart,
  deleteCartItem,
  postOrder,
} = require('../controllers/shop');

router.get('/', getIndexPage);

router.get('/products', getProducts);

router.get('/products/:id', getProduct);

router.route('/cart').get(showCart).post(postCart);

router.post('/cart-delete-item', deleteCartItem);

router.get('/orders', getOrders);

// // router.get('/checkout', getCheckoutPage);

router.post('/create-order', postOrder);

module.exports = router;
