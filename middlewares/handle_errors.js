const { validationResult } = require('express-validator');
const { getError } = require('../util/helpers');

module.exports = (template, options, func) => {
  return async (req, res, next) => {
    const errors = validationResult(req);
    let renderedData = {};
    if (!errors.isEmpty()) {
      let data = {};
      if (func) {
        data = await func(req);
      }

      renderedData = { errors, getError, data, ...options, ...renderedData };
      //console.log(renderedData);

      return res.render(template, renderedData);
    }

    next();
  };
};
