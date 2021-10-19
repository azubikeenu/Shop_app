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
  UserModel.findById('615f8907a783c7e2f2322886').then((user) => {
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      console.log('error');
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
