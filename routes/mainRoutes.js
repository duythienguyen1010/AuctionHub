const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

//GET /: send user to the homepage
router.get('/', controller.index);

//GET /contacts: send user to the contact us page
router.get('/contacts', controller.contact);

//GET /about: send user to the about us page
router.get('/about', controller.about);

module.exports = router;
