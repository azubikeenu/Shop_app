const { validationResult } = require('express-validator');
const { getError } = require('../util/helpers');

module.exports = (template, options, func) => {
  return async (req, res, next) => {
    const errors = validationResult(req);
    let renderedData = {};
    //this is used to retain form data  between requests when error occurs
    const oldInput = { ...req.body };
    if (!errors.isEmpty()) {
      let data = {};
      if (func) {
        data = await func(req);
      }
      renderedData = {
        errors,
        getError,
        data,
        ...options,
        ...renderedData,
        oldInput,
      };

      return res.status(422).render(template, renderedData);
    }

    next();
  };
};
