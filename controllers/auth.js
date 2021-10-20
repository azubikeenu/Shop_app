const UserModel = require('../data/schema/user');

module.exports.renderLogin = (req, res, next) => {
  res.render('auth/login', {
    title: 'Login',
    path: '/login',
    isAuthenticated: false,
  });
};

module.exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie', 'loggedIn=true ;HttpOnly')
  const { email } = req.body;
  UserModel.findOne({ email }).then((user) => {
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      console.log(err);
      res.redirect('/');
    });
  });
};

module.exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

module.exports.signUp = async (req, res, next) => {
  const { email, password } = req.body;
  UserModel.create({ email, password, cart: { items: [] } })
    .then(() => {
      req.session.isLoggedIn = true;
      return res.redirect('/login');
    })
    .catch((err) => console.log(err));
};

module.exports.renderSignUp = (req, res, next) => {
  res.status(200).render('auth/signup', {
    title: 'Signup',
    path: '/auth/signup',
    isAuthenticated: false,
  });
};
