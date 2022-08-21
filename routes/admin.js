const {
  requireTitle,
  requirePrice
} = require( '../util/validator' );

const router = require( 'express' ).Router();
const handleErrors = require( '../middlewares/handle_errors' );
const {
  isLoggedIn
} = require( '../middlewares/isloggedin' );
const {
  resizeImage,
  uploadPhoto
} = require( '../middlewares/upload' )

const {
  getAddProducts,
  postAddProduct,
  showProducts,
  showEditPage,
  editProduct,
  getProduct,
  deleteProduct,
  deleteProductAsync
} = require( '../controllers/admin' );

router.use( isLoggedIn );

router
  .route( '/add-product' )
  .get( getAddProducts )
  .post(
    uploadPhoto,
    resizeImage,
    [ requireTitle, requirePrice ],
    handleErrors( 'admin/add-product', {
      title: 'Add Product',
      path: '/admin/add-product',
      isAuthenticated: true,
    } ),
    postAddProduct
  );

router.route( '/products' ).get( showProducts );

router.route( '/edit-product' ).get( showEditPage );

router.route( '/edit-product' ).post(
  uploadPhoto,
  resizeImage,
  [ requireTitle, requirePrice ],
  handleErrors(
    'admin/edit-product', {
      title: 'Edit Product',
      path: '/admin/edit-product',
      isAuthenticated: true,
    },
    getProduct
  ),
  editProduct
);

router.get( '/delete-product', deleteProduct );

router.delete( '/delete-product/:id', deleteProductAsync )

module.exports = router;