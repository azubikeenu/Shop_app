const multer = require('multer');
const crypto = require('crypto');
const sharp = require('sharp');
const path = require('path');
const { cropText, deleteFileFromPath } = require('../util/helpers');
const multerStorage = multer.memoryStorage();

const { renderProducts } = require('../util/render_products');

const Product = require('../data/schema/product');

const upload = multer({ storage: multerStorage });

module.exports.getAddProducts = (req, res, next) => {
  res.status(200).render('admin/add-product', {
    title: 'Add Product',
    path: '/admin/add-product',
  });
};

exports.resizeImage = (req, res, next) => {
  const randomId = crypto.randomBytes(4).toString('hex');
  if (!req.file) {
    return next();
  }
  req.file.filename = `${randomId}-${Date.now()}.png`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('png')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);
  next();
};

module.exports.uploadPhoto = upload.single('photo');

module.exports.postAddProduct = (req, res, next) => {
  if (req.file) req.body.imageUrl = req.file.filename;
  req.body.userId = req.session.user;
  Product.create(req.body)
    .then(() => res.redirect('/admin/products'))
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.showProducts = async (req, res, next) => {
  const { count, products, page, perPage } = await renderProducts(req, next);
  return res.render('admin/products', {
    prods: products,
    title: 'All Products',
    path: 'admin/products',
    cropText,
    current: page,
    pages: Math.ceil(count / perPage),
  });
};

const deleteImageFromPath = (imageUrl) => {
  const imagePath = path.join(__dirname, `../public/img/${imageUrl}`);
  return imageUrl !== 'product.png'
    ? deleteFileFromPath(imagePath)
    : Promise.resolve();
};

module.exports.showEditPage = async (req, res, next) => {
  const { id } = req.query;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.status(200).render('admin/edit-product', {
        product,
        title: 'Edit product',
        path: 'admin/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.editProduct = async (req, res, next) => {
  const { id } = req.body;
  const previousImage = req.body.imageUrl;
  //if there is an image file
  if (req.file) req.body.imageUrl = req.file.filename;
  Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: false,
  })
    .then(() => {
      if (req.file) {
        deleteImageFromPath(previousImage);
      } else return Promise.resolve();
    })
    .then(() => res.redirect('/admin/products'))
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.getProduct = async (req, res, next) => {
  const id = req.body.id;
  try {
    const product = await Product.findById(id);
    return product;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports.deleteProduct = async (req, res, next) => {
  const { id } = req.query;
  Product.findByIdAndDelete(id)
    .then(async (product) => {
      await req.user.deleteFromCart(id);
      deleteImageFromPath(product.imageUrl);
    })
    .then(() => {
      return res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};


module.exports.deleteProductAsync = (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  Product.findByIdAndDelete(id)
    .then(async (product) => {
      await req.user.deleteFromCart(id);
      deleteImageFromPath(product.imageUrl);
    })
    .then(() => {
      res.status(200).json({
        message: 'DELETED',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};
