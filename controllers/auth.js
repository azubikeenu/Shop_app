const User = require('../data/schema/user');
const Email = require('../util/email');
const crypto = require('crypto');
const { getFlashMessage, setFlashMessage } = require('../util/helpers');

module.exports.renderLogin = (req, res, next) => {
  let successMessage = getFlashMessage(req, 'success');
  let errorMessage = getFlashMessage(req, 'error');
  res.render('auth/login', {
    title: 'Login',
    path: '/login',
    successMessage,
    errorMessage,
  });
};

module.exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie', 'loggedIn=true ;HttpOnly')
  const { email } = req.body;
  User.findOne({ email }).then((user) => {
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      if (err) console.log(err);
      res.redirect('/');
    });
  });
};

module.exports.logout = (req, res, next) => {
  req.session.isLoggedIn = false;
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

module.exports.signUp = async (req, res, next) => {
  const { email, password } = req.body;
  User.create({ email, password, cart: { items: [] } })
    .then(async (user) => {
      res.redirect('/login');
      return await new Email(user).sendWelcome();
    })
    .catch((err) => console.log(err));
};

module.exports.renderSignUp = (req, res, next) => {
  res.status(200).render('auth/signup', {
    title: 'Signup',
    path: '/auth/signup',
  });
};

module.exports.renderResetPassword = (req, res, next) => {
  let successMessage = getFlashMessage(req, 'success');
  let errorMessage = getFlashMessage(req, 'error');
  res.status(200).render('auth/forgot-password', {
    title: 'Forgot Password',
    path: '/auth/forgot-password',
    successMessage,
    errorMessage,
  });
};

module.exports.sendResetToken = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/new-password/${resetToken}`;

    setFlashMessage(
      req,
      'success',
      `Password reset token sent to ${req.body.email}`
    );
    res.redirect('/reset-password');
    return await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    // rollback changes if an error occurs
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    setFlashMessage(req, 'error', `There was a problem sending this email `);
    res.redirect('/reset-password');
    return await user.save({ validateBeforeSave: false });
  }
};

module.exports.renderNewPassword = (req, res, next) => {
  const token = req.params.token;
  res.status(200).render('auth/new-password', {
    title: 'New Password',
    path: '/auth/new-password',
    token,
  });
};

module.exports.updatePassword = async (req, res, next) => {
  const passwordResetToken = req.params.token
    ? req.params.token
    : req.body.token;
  const token = crypto
    .createHash('sha256')
    .update(passwordResetToken)
    .digest('hex');
  //get the user based on the token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }, // this only returns of the reset token is still valid
  });
  if (!user) {
    setFlashMessage(req, 'error', 'Invalid token or token expired');

    res.redirect('/reset-password');
  }
  // update the new password for the new user
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  setFlashMessage(req, 'success', 'Password successfully changed');
  res.redirect('/login');
  return await user.save();
};
