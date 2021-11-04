module.exports.get404 = (req, res, next) => {
  return res.status(404).render('404', {
    title: 'Page not found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn,
  });
};
// method for handling server errors

module.exports.get500 = (req, res, next) => {
  return res.status(500).render('server_error', {
    title: 'Error!',
    path: './server_error',
    isAuthenticated: req.session.isLoggedIn,
  });
};
