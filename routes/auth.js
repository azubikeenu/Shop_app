const express = require('express');
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireValidEmail,
  loginEmail,
  loginPassword
} = require('../util/validator');
const handleErrors = require('../middlewares/handle_errors');

const {
  renderLogin,
  postLogin,
  logout,
  renderSignUp,
  signUp,
  renderResetPassword,
  sendResetToken,
  renderNewPassword,
  updatePassword,
} = require('../controllers/auth');

const router = express.Router();

router
  .route('/login')
  .get(renderLogin)
  .post(
    [loginEmail, loginPassword],
    handleErrors('auth/login', {
      title: 'Login',
      path: '/auth/login',
      // isAuthenticated: false,
    }),
    postLogin
  );
router.post('/logout', logout);
router
  .route('/signup')
  .get(renderSignUp)
  .post(
    [requireEmail, requirePassword, requirePasswordConfirmation],
    handleErrors('auth/signup', {
      title: 'Signup',
      path: '/auth/signup',
      // isAuthenticated: false,
    }),
    signUp
  );

router
  .route('/reset-password')
  .get(renderResetPassword)
  .post(
    [requireValidEmail],
    handleErrors('auth/forgot-password', {
      title: 'Reset Password',
      path: '/auth/forgot-password',
      // isAuthenticated: false,
    }),
    sendResetToken
  );

router.get('/new-password/:token', renderNewPassword);

router.post(
  '/new-password',
  [requirePassword, requirePasswordConfirmation],
  handleErrors('auth/new-password', {
    title: 'New Password',
    path: '/auth/new-password',
  }),
  updatePassword
);
module.exports = router;
