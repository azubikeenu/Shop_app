const { validationResult } = require('express-validator');
const { getError } = require('../util/helpers');

module.exports = (template, options, func) => {
  return async (req, res, next) => {
    const errors = validationResult(req);
    let renderedData = {};
    //this is used to pass token between requests when error occurs
    const { token } = req.body;
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
        token,
      };

      return res.render(template, renderedData);
    }

    next();
  };
};
