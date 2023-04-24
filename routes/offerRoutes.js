const express = require('express');
const controller = require('../controllers/offerController');
const { validateId } = require('../middlewares/validator');
const { isLoggedIn, isParty, isNotTrader, isRecipient, isCreator } = require('../middlewares/auth');

const router = express.Router();

//GET /offers/new: send user to new offer page
router.get('/:id/new', isLoggedIn, controller.new);

//POST /offers: create a new offer
router.post('/create/:id', isLoggedIn, controller.create);

//PUT /watch/:id: add trade to user watchlist
router.put('/watch/:id', validateId, isLoggedIn, isNotTrader, controller.watch);

//PUT /updateWatch/:id: remove trade from user watchlist
router.put('/updateWatch/:id', validateId, isLoggedIn, isNotTrader, controller.updateWatch);

module.exports = router;
