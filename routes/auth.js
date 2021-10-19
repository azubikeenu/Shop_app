const express = require('express');

const { renderLogin, postLogin ,logout} = require('../controllers/auth');

const router = express.Router();

router.route('/login').get(renderLogin).post(postLogin);
router.post('/logout', logout)

module.exports = router;
