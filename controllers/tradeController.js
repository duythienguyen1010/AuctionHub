const model = require('../models/trade');
const User = require('../models/user');
const Offer = require('../models/offer');
const calculator = require('../middlewares/timeCalculation');
var fs = require('fs');
var path = require('path');

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

exports.index = (req, res, next) => {
    model
        .find()
        .populate('trader', 'firstName lastName contact')
        .then((trades) => {
            trades.forEach((trade) => {
                let time = calculator.timeCalculation(trade);
                if (time.ms <= 0) {
                    model.findByIdAndUpdate(trade, { status: 'Closed' }).catch((err) => next(err));
                }
            });
            res.render('trade/trades', { trades });
        })
        .catch((err) => next(err));
};

exports.new = (req, res) => {
    res.render('trade/newTrade');
};

exports.create = (req, res, next) => {
    console.log(req.body)
    if (req.body.initialPrice >= 1) {
        let trade = new model({
            id: '',
            title: '',
            trader: '',
            // images: ['images/no-image-available.jpg'],
            img: {},
            bestBidder: '',
            description: '',
            status: '',
            initialPrice: 0,
            bestPrice: 0,
            expiration: new Date(),
        });
        trade.title = req.body.itemName;
        trade.description = req.body.description;
        trade.status = 'available';
        trade.trader = req.session.user;
        trade.bestBidder = req.session.user;
        trade.initialPrice = req.body.initialPrice;
        trade.bestPrice = req.body.initialPrice;
        trade.expiration = req.body.expiration;
        trade.img = {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
        // if (req.body.pictures) {
        //     trade.images.push(req.body.pictures);
        // } else {
        //     for (let i = 0; i < 3; i++) {
        //         trade.images.push('images/no-image-available.jpg');
        //     }
        // }

        trade
            .save()
            .then((trade) => {
                console.log(trade)
                res.redirect('/trades');
            })
            .catch((err) => {
                if (err.name === 'ValidationError') {
                    err.status = 400;
                }
                next(err);
            });
    } else {
        req.flash('error', 'Starting price must be at least $1');
        res.redirect('/trades/new');
    }
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model
        .findById(id)
        .populate('trader', 'firstName lastName contact')
        .populate('bestBidder', 'firstName lastName')
        .then((trade) => {
            if (trade) {
                let currentUser = req.session.user;

                let time = calculator.timeCalculation(trade);
                if (time.ms <= 0) {
                    model.findByIdAndUpdate(id, { status: 'Closed' }).catch((err) => next(err));
                }
                if (currentUser) {
                    User.findById(currentUser).then((userDetails) => {
                        return res.render('./trade/trade', {
                            trade,
                            userDetails,
                            time,
                        });
                    });
                } else {
                    return res.render('./trade/trade', { trade, time });
                }
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model
        .findById(id)
        .then((trade) => {
            if (trade) {
                return res.render('./trade/editTrade', { trade });
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => next(err));
};

exports.update = (req, res, next) => {
    let trade = req.body;
    let id = req.params.id;
    model
        .findByIdAndUpdate(id, trade, {
            useFindAndModify: false,
            runValidators: true,
        })
        .then((trade) => {
            if (trade) {
                let time = calculator.timeCalculation(trade);
                if (time.ms > 0 && trade.status == 'available') {
                    res.redirect('/trades/' + id);
                } else {
                    let err = new Error(
                        'Cannot Update Listing that has ended, please relist. Trade id: ' + id
                    );
                    err.status = 404;
                    next(err);
                }
            } else {
                let err = new Error('Cannot find a listing with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Promise.all([Offer.find({ item1: id }), Offer.find({ item2: id })])
        .then((result) => {
            const [item1, item2] = result;
            item1.forEach((offer) => {
                Offer.findByIdAndDelete(offer.id)
                    .then(() => {
                        model
                            .findByIdAndUpdate(offer.item2, {
                                status: 'available',
                            })
                            .catch((err) => next(err));
                        console.log('offer: ' + offer.id + ' has been deleted');
                    })
                    .catch((err) => next(err));
            });
            item2.forEach((offer) => {
                Offer.findByIdAndDelete(offer.id)
                    .then(() => {
                        model
                            .findByIdAndUpdate(offer.item2, {
                                status: 'available',
                            })
                            .catch((err) => next(err));
                        console.log('offer: ' + offer.id + ' has been deleted');
                    })
                    .catch((err) => next(err));
            });
            model
                .findByIdAndDelete(id, { useFindAndModify: false })
                .then((trade) => {
                    if (trade) {
                        res.redirect('/trades');
                    } else {
                        let err = new Error('Cannot find a trade with id ' + id);
                        err.status = 404;
                        next(err);
                    }
                })
                .catch((err) => next(err));
        })
        .catch((err) => next(err));
};
