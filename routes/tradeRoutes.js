const express = require('express');
const controller = require('../controllers/tradeController');
const { isLoggedIn, isTrader } = require('../middlewares/auth');
const {
    validateId,
    validateTrade,
    validateResult,
    validateEditTrade,
} = require('../middlewares/validator');
//middleware upload img
const upload = require("../middlewares/upload");
const router = express.Router();

//GET /trades: send all trades to the user
router.get('/', controller.index);

//GET /stories/new: send html form to create new trade
router.get('/new', isLoggedIn, controller.new);

//POST /trades: create a new trade
router.post('/', upload.single('image'), isLoggedIn, validateTrade, validateResult, controller.create);

//GET /trades/:id: send detail of a trade identified by id
router.get('/:id', validateId, controller.show);

//GET /trades/:id/edit: send html form for editing an existing trade
router.get('/:id/edit', isLoggedIn, validateId, isTrader, controller.edit);

//PUT /trades/:id: update the trade identified by id
router.put(
    '/:id',
    isLoggedIn,
    validateId,
    isTrader,
    validateEditTrade,
    validateResult,
    controller.update
);

// UPLOAD img:
router.post("/upload", upload.single("file"), async (req, res) => {
    if (req.file === undefined) return res.send("you must select a file.");
    const imgUrl = `http://localhost:3000/file/${req.file.filename}`;
    return res.send(imgUrl);
});
//DELETE /trades/:id: delete trade identified by id
router.delete('/:id', isLoggedIn, validateId, isTrader, controller.delete);

module.exports = router;
