const multer = require('multer');
const crypto = require('crypto');
const sharp = require('sharp');
const { cropText } = require('../util/helpers');
const multerStorage = multer.memoryStorage();

const Product = require('../data/schema/product');

module.exports.getAddProducts = (req, res, next) => {
  res.status(200).render('admin/add-product', {
    title: 'Add Product',
    path: '/admin/add-product',
  });
};

const upload = multer({ storage: multerStorage });

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
      console.log('herer');
      const error = new Error(err);
      error.statusCode = 500;
      return next(error);
    });
};

module.exports.showProducts = async (req, res, next) => {
  Product.find()
    .then((products) => {
      return res.render('admin/products', {
        prods: products,
        title: 'All Products',
        path: 'admin/products',
        cropText,
      });
    })
    .catch((err) => console.log(err));
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
    .catch((err) => console.log(err));
};

module.exports.editProduct = async (req, res, next) => {
  //if there is an image file
  const { id } = req.body;
  if (req.file) req.body.imageUrl = req.file.filename;
  Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: false,
  })
    .then(() => res.redirect('/admin/products'))
    .catch((err) => console.log(err));
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
    .then(async () => {
      await req.user.deleteFromCart(id);
      return res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
