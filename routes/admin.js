const { requireTitle, requirePrice } = require('../util/validator');

const router = require('express').Router();
const handleErrors = require('../middlewares/handle_errors');

const {
  getAddProducts,
  postAddProduct,
  showProducts,
  uploadPhoto,
  resizeImage,
  showEditPage,
  editProduct,
  getProduct,
  deleteProduct,
} = require('../controllers/admin');

router
  .route('/add-product')
  .get(getAddProducts)
  .post(
    uploadPhoto,
    resizeImage,
    [requireTitle, requirePrice],
    handleErrors('admin/add-product', {
      title: 'Add Product',
      path: '/admin/add-product',
    }),
    postAddProduct
  );

router.route('/products').get(showProducts);

router.route('/edit-product').get(showEditPage);

router.route('/edit-product').post(
  uploadPhoto,
  resizeImage,
  [requireTitle, requirePrice],
  handleErrors(
    'admin/edit-product',
    {
      title: 'Edit Product',
      path: '/admin/edit-product',
    },
    getProduct
  ),
  editProduct
);

router.get('/delete-product', deleteProduct);

module.exports = router;
