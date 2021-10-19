const multer = require('multer');
const crypto = require('crypto');
const sharp = require('sharp');
const { cropText } = require('../util/helpers');
const multerStorage = multer.memoryStorage();

const ProductModel = require('../data/schema/product');

/*Using disk storage */
// destination: (req, file, cb) => {
//   cb(null, 'public/img');
// },
// filename: (req, file, cb) => {
//   const ext = file.mimetype.split('/')[1];
//   const randomId = crypto.randomBytes(4).toString('hex');
//   req.filename = `${randomId}-${Date.now()}.${ext}`;
//   cb(null, req.filename);
// },

// const multerFilter =(req,file,cb)=>{
//   if(file.mimetype.startsWith('image')){
//     cb(null, true)
//   }else{
//    return alert('can only upload images');
//   }
// }

module.exports.getAddProducts = (req, res, next) => {
  res.status(200).render('admin/add-product', {
    title: 'Add Product',
    path: '/admin/add-product',
    isAuthenticated: req.session.isLoggedIn
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
  ProductModel.create(req.body)
    .then(() => res.redirect('/admin/products'))
    .catch((err) => console.log(err));
};

module.exports.showProducts = async (req, res, next) => {
  ProductModel.find()
    .then((products) => {
      return res.render('admin/products', {
        prods: products,
        title: 'All Products',
        path: 'admin/products',
        isAuthenticated: req.session.isLoggedIn,
        cropText,
      });
    })
    .catch((err) => console.log(err));
};

module.exports.showEditPage = async (req, res, next) => {
  const { id } = req.query;
  ProductModel.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.status(200).render('admin/edit-product', {
        product,
        title: 'Edit product',
        path: 'admin/products',
        isAuthenticated : req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

module.exports.editProduct = async (req, res, next) => {
  //if there is an image file
  if (req.file) req.body.imageUrl = req.file.filename;
  ProductModel.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: false,
  })
    .then(() => res.redirect('/admin/products'))
    .catch((err) => console.log(err));
};

module.exports.getProduct = async (req, res, next) => {
  const id = req.query.id;
  try {
    const product = await ProductModel.findById(id);
    return product;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports.deleteProduct = async (req, res, next) => {
  const { id } = req.query;
  ProductModel.findByIdAndDelete(id)
    .then(async () => {
      await req.user.deleteFromCart(id);
      return res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
