const {
  cropText
} = require( '../util/helpers' );
const Product = require( '../data/schema/product' );
const Order = require( '../data/schema/order' );
const User = require( '../data/schema/user' );
const path = require( 'path' );
const fs = require( 'fs' );
const {
  renderProducts
} = require( '../util/render_products' );

const {
  generatePdf,
  options
} = require( '../util/generate_pdf' );

module.exports.getProducts = async ( req, res, next ) => {
  const {
    count,
    products,
    page,
    perPage
  } = await renderProducts( req, next );
  return res.render( 'shop/product-list', {
    prods: products,
    title: 'All Products',
    path: '/products',
    cropText,
    current: page,
    count,
    pages: Math.ceil( count / perPage ),
  } );
};

module.exports.getIndexPage = async ( req, res, next ) => {
  const {
    count,
    products,
    page,
    perPage
  } = await renderProducts( req, next );
  return res.render( 'shop/index', {
    prods: products,
    title: 'Shop',
    path: '/',
    cropText,
    current: page,
    count,
    pages: Math.ceil( count / perPage ),
  } );
};

module.exports.showCart = async ( req, res, next ) => {
  const products = [];
  try {
    const {
      cart
    } = await User.findById( req.session.user ).populate(
      'cart.items.product'
    );
    if ( cart.items.length > 0 ) {
      for ( const {
          product,
          quantity
        } of cart.items ) {
        product.quantity = quantity;
        products.push( product );
      }
    }
    return res.status( 200 ).render( 'shop/cart', {
      title: 'Your Cart',
      path: '/cart',
      products,
    } );
  } catch ( err ) {
    const error = new Error( err );
    error.statusCode = 500;
    return next( error );
  }
};

module.exports.getProduct = ( req, res, next ) => {
  const {
    id
  } = req.params;
  Product.findById( id )
    .then( ( product ) => {
      res.status( 200 ).render( 'shop/product-detail', {
        title: `${product.title}`,
        path: '/products',
        product: product,
      } );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.postCart = ( req, res, next ) => {
  const {
    id
  } = req.body;
  req.user
    .addToCart( id )
    .then( res.redirect( 'cart/' ) )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.deleteCartItem = ( req, res, next ) => {
  const id = req.body.productId;

  req.user
    .deleteFromCart( id )
    .then( () => {
      console.log( 'Item deleted from cart' );
      res.redirect( '/cart' );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.postOrder = async ( req, res, next ) => {
  const {
    cart
  } = await User.findById( req.session.user ).populate(
    'cart.items.product'
  );
  const products = cart.items.map( ( {
    product,
    quantity
  } ) => {
    return {
      product: {
        ...product.toJSON()
      },
      quantity
    };
  } );
  const user = {
    email: req.user.email,
    userId: req.session.user._id,
  };
  Order.create( {
      products,
      user
    } )
    .then( async () => {
      req.user.cart.items = [];
      await req.user.save();
      res.redirect( '/orders' );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

module.exports.getOrders = ( req, res, next ) => {
  Order.find( {
      'user.userId': req.session.user._id
    } )
    .then( ( orders ) => {
      return res.status( 200 ).render( 'shop/orders', {
        title: 'Your Cart',
        path: '/orders',
        orders,
      } );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};

const createPdfDoc = ( filePath, order ) => {
  const template = '.././views/template.html';
  const products = order.products.map( ( p, index ) => {
    return {
      title: p.product.title,
      description: p.product.description,
      quantity: order.products[ index ].quantity,
      price: p.product.price,
      imageUrl: p.product.imageUrl,
      total: order.products[ index ].quantity * p.product.price,
    };
  } );
  const subtotal = products.reduce( ( acc, curr ) => acc + curr.total, 0 );

  const data = {
    products,
    subtotal,
    username: order.user.email,
    date: new Date().toDateString(),
  };
  return generatePdf( template, data, options, filePath );
};


module.exports.getInvoice = ( req, res, next ) => {
  const {
    orderId
  } = req.params;
  Order.findById( orderId )
    .then( async ( order ) => {
      if ( !order ) {
        return next( new Error( 'Order not found in the db' ) );
      }
      if ( order.user.userId.toString() !== req.user._id.toString() ) {
        return next( new Error( 'Unauthorized' ) );
      }
      const filename = `invoice-${orderId}.pdf`;
      let filePath = path.join( 'docs', filename );
      await createPdfDoc( filePath, order );
      filePath = filePath.replace( '\\', '/' )
      const file = fs.createReadStream( filePath );
      res.setHeader( 'Content-disposition', 'inline; filename="' + filename + '"' );
      res.setHeader( 'Content-type', 'application/pdf' );

      file.pipe( res );
    } )
    .catch( ( err ) => {
      const error = new Error( err );
      error.statusCode = 500;
      return next( error );
    } );
};