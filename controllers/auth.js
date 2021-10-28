const UserModel = require('../data/schema/user');
const Email = require('../util/email');
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
    .then(async (user) => {
      res.redirect('/login');
      req.session.isLoggedIn = false;
      return await new Email(user).sendWelcome();
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

module.exports.renderResetPassword = (req, res, next) => {
  let message = req.flash('success');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.status(200).render('auth/forgot-password', {
    title: 'Forgot Password',
    path: '/auth/forgot-password',
    isAuthenticated: false,
    successMessage: message,
  });
};

module.exports.sendResetToken = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/performPasswordReset/${resetToken}`;
    req.flash('success', `Password reset token sent to ${req.body.email}`);
    res.redirect('/reset-password');
    return await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    // rollback if an error occurs
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    req.flash('success', `There was a problem sending this email `);
    res.redirect('/reset-password');
    return await user.save({ validateBeforeSave: false });
  }
};
