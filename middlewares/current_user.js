const User = require('../data/schema/user');

module.exports = (req, res, next) => {
  // check if session exists
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) return next(); //check if the user was deleted in the database
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err)) ;
    });
};
