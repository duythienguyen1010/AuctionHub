const model = require('../models/trade');
const User = require('../models/user');
const Offer = require('../models/offer');

exports.index = (req, res, next) => {
    model
        .find()
        .populate('trader', 'firstName lastName contact')
        .then((trades) => res.render('trade/trades', { trades }))
        .catch((err) => next(err));
};

exports.new = (req, res) => {
    res.render('trade/newTrade');
};

exports.create = (req, res, next) => {
    let trade = new model({
        id: '',
        title: '',
        trader: '',
        images: ['images/no-image-available.jpg'],
        description: '',
        status: '',
    });
    trade.title = req.body.itemName;
    trade.description = req.body.description;
    trade.status = 'available';
    trade.trader = req.session.user;
    if (req.body.pictures) {
        trade.images.push(req.body.pictures);
    } else {
        for (let i = 0; i < 3; i++) {
            trade.images.push('images/no-image-available.jpg');
        }
    }

    trade
        .save()
        .then((trade) => {
            res.redirect('/trades');
        })
        .catch((err) => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model
        .findById(id)
        .populate('trader', 'firstName lastName contact')
        .then((trade) => {
            if (trade) {
                let currentUser = req.session.user;
                if (currentUser) {
                    User.findById(currentUser).then((userDetails) => {
                        return res.render('./trade/trade', { trade, userDetails });
                    });
                } else {
                    return res.render('./trade/trade', { trade });
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
        .findByIdAndUpdate(id, trade, { useFindAndModify: false, runValidators: true })
        .then((trade) => {
            if (trade) {
                res.redirect('/trades/' + id);
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
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
                            .findByIdAndUpdate(offer.item2, { status: 'available' })
                            .catch((err) => next(err));
                        console.log('offer: ' + offer.id + ' has been deleted');
                    })
                    .catch((err) => next(err));
            });
            item2.forEach((offer) => {
                Offer.findByIdAndDelete(offer.id)
                    .then(() => {
                        model
                            .findByIdAndUpdate(offer.item2, { status: 'available' })
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
