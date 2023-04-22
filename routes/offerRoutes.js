const express = require('express');
const controller = require('../controllers/offerController');
const { validateId } = require('../middlewares/validator');
const { isLoggedIn, isParty, isNotTrader, isRecipient, isCreator } = require('../middlewares/auth');

const router = express.Router();

//GET /offers/new: send user to new offer page
router.get('/:id/new', isLoggedIn, controller.new);

//POST /offers: create a new offer
router.post('/create/:id', isLoggedIn, controller.create);

//GET /offers/:id: send user the offer
router.get('/:id', validateId, isLoggedIn, isParty, controller.show);

//PUT /watch/:id: add trade to user watchlist
router.put('/watch/:id', validateId, isLoggedIn, isNotTrader, controller.watch);

//PUT /updateWatch/:id: remove trade from user watchlist
router.put('/updateWatch/:id', validateId, isLoggedIn, isNotTrader, controller.updateWatch);

//GET /update/:id: send user to the edit offer page
router.get('/update/:id', validateId, isLoggedIn, isCreator, controller.edit);

//PUT /update/:id: update offer
router.put('/update/:id', validateId, isLoggedIn, isCreator, controller.update);

//DELETE /:id: delete offer
router.delete('/:id', validateId, isLoggedIn, isCreator, controller.delete);

//PUT /accept/:id: accept offer
router.put('/accept/:id', validateId, isLoggedIn, isRecipient, controller.accept);

//PUT /deny/:id: deny offer
router.put('/deny/:id', validateId, isLoggedIn, isRecipient, controller.deny);

module.exports = router;
