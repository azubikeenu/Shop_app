const path = require( 'path' );
const {
  existsSync
} = require( 'fs' )
const {
  cropText,
  deleteFileFromPath
} = require( '../util/helpers' );


const {
  renderProducts
} = require( '../util/render_products' );

const Product = require( '../data/schema/product' );


module.exports.getAddProducts = ( req, res, next ) => {
  res.status( 200 ).render( 'admin/add-product', {
    title: 'Add Product',
    path: '/admin/add-product',
  } );
};


module.exports.postAddProduct = ( req, res, next ) => {
  if ( req.file ) req.body.imageUrl = req.file.filename;
  req.body.userId = req.session.user;
  Product.create( req.body )
    .then( () => res.redirect( '/admin/products' ) )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.showProducts = async ( req, res, next ) => {
  const {
    count,
    products,
    page,
    perPage
  } = await renderProducts( req, next );
  return res.render( 'admin/products', {
    prods: products,
    title: 'All Products',
    path: 'admin/products',
    cropText,
    current: page,
    count,
    pages: Math.ceil( count / perPage ),
  } );
};

const deleteImageFromPath = ( imageUrl ) => {
  const imagePath = path.join( __dirname, `../public/img/${imageUrl}` );
  if ( existsSync( imagePath ) ) {
    return imageUrl !== 'product.png' ?
      deleteFileFromPath( imagePath ) :
      Promise.resolve();
  }

};

module.exports.showEditPage = async ( req, res, next ) => {
  const {
    id
  } = req.query;
  Product.findById( id )
    .then( ( product ) => {
      if ( !product ) {
        return res.redirect( '/' );
      }
      res.status( 200 ).render( 'admin/edit-product', {
        product,
        title: 'Edit product',
        path: 'admin/products',
      } );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.editProduct = async ( req, res, next ) => {
  const {
    id
  } = req.body;
  const previousImage = req.body.imageUrl;
  //if there is an image file
  if ( req.file ) req.body.imageUrl = req.file.filename;
  Product.findByIdAndUpdate( id, req.body, {
      new: true,
      runValidators: false,
    } ).then( () => {
      if ( req.file ) {
        deleteImageFromPath( previousImage );
      } else return Promise.resolve();
    } )
    .then( () => res.redirect( '/admin/products' ) )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.getProduct = async ( req, res, next ) => {
  const id = req.body.id;
  try {
    const product = await Product.findById( id );
    return product;
  } catch ( err ) {
    throw new Error( err.message );
  }
};

module.exports.deleteProduct = async ( req, res, next ) => {
  const {
    id
  } = req.query;
  Product.findByIdAndDelete( id )
    .then( async ( product ) => {
      await req.user.deleteFromCart( id );
      deleteImageFromPath( product.imageUrl );
    } )
    .then( () => {
      return res.redirect( '/admin/products' );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};


module.exports.deleteProductAsync = ( req, res, next ) => {
  const {
    id
  } = req.params;
  Product.findByIdAndDelete( id )
    .then( async ( product ) => {
      await req.user.deleteFromCart( id );
      deleteImageFromPath( product.imageUrl );
    } )
    .then( () => {
      res.status( 200 ).json( {
        message: 'DELETED',
      } );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};