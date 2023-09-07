const express = require('express');
const controller = require('../controllers/tradeController');
const { isLoggedIn, isTrader } = require('../middlewares/auth');
const {
    validateId,
    validateTrade,
    validateResult,
    validateEditTrade,
} = require('../middlewares/validator');
const store = require('../middlewares/multer');

const router = express.Router();

//GET /trades: send all trades to the user
router.get('/', controller.index);

//GET /stories/new: send html form to create new trade
router.get('/new', isLoggedIn, controller.new);

//POST /trades: create a new trade
router.post(
    '/',
    store.array('images', 4),
    isLoggedIn,
    validateTrade,
    validateResult,
    controller.create
);

//GET /trades/:id: send detail of a trade identified by id
router.get('/:id', validateId, controller.show);

//GET /trades/:id/edit: send html form for editing an existing trade
router.get('/:id/edit', isLoggedIn, validateId, isTrader, controller.edit);

//PUT /trades/:id: update the trade identified by id
router.put(
    '/:id',
    store.array('images', 4),
    isLoggedIn,
    validateId,
    isTrader,
    validateEditTrade,
    validateResult,
    controller.update
);

//DELETE /trades/:id: delete trade identified by id
router.delete('/:id', isLoggedIn, validateId, isTrader, controller.delete);

module.exports = router;
