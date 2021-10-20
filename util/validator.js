const { check } = require('express-validator');
const UserModel = require('../data/schema/user');

module.exports = {
  requireTitle: check('title')
    .trim()
    .isLength({ min: 4, max: 100 })
    .withMessage('characters must be between 4 and 20'),
  requirePrice: check('price')
    .trim()
    .toFloat()
    .isFloat({ min: 1 })
    .withMessage('enter a valid price'),

  requireEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid email')
    .custom(async (email) => {
      const isExistingUser = await UserModel.findOne({ email }).exec();
      if (isExistingUser) {
        throw new Error('Email already in use!!');
      }
    }),

  requirePassword: check('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Must be between 4 to 20 characters'),

  requirePasswordConfirmation: check('passwordConfirmation')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Must be between 4 and 20 characters')
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new Error('Passwords must match');
      }
      return true;
    }),

  requireValidEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must provide a valid email')
    .custom(async (email) => {
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new Error('Email not found !!');
      }
    }),

  requireValidUserPassword: check('password')
    .trim()
    .custom(async (password, { req }) => {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        throw new Error('Invalid Credentails !!');
      }
      const isValidPassword = await user.comparePasswords(
        password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error('Invalid Credentails !!');
      }
    }),
};
