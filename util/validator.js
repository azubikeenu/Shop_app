const { check } = require('express-validator');

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
};
