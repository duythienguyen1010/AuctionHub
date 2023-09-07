const model = require('../models/trade');
const User = require('../models/user');
const Image = require('../models/image');
const calculator = require('../middlewares/timeCalculation');
const fs = require('fs');

exports.index = (req, res, next) => {
    model
        .find()
        .populate('trader', 'firstName lastName contact')
        .populate('images', 'creator contentType imageBase64')
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
    let files = req.files;

    if (files.length >= 1) {
        if (req.body.initialPrice >= 1) {
            let trade = new model({
                id: '',
                title: '',
                trader: '',
                images: [],
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
            trade
                .save()
                .then((trade) => {})
                .catch((err) => {
                    if (err.name === 'ValidationError') {
                        err.status = 400;
                    }
                });

            // convert images into base64 encoding
            let imgArray = files.map((file) => {
                let img = fs.readFileSync(file.path);

                return (encode_image = img.toString('base64'));
            });

            imgArray.map((src, index) => {
                // create object to store data in the collection
                let finalImg = {
                    creator: req.session.user,
                    filename: files[index].originalname,
                    contentType: files[index].mimetype,
                    imageBase64: src,
                };

                new Image(finalImg)
                    .save()
                    .then((img) => {
                        model
                            .findByIdAndUpdate(trade._id, {
                                $push: { images: img },
                            })
                            .catch((err) => next(err));
                    })
                    .catch((err) => {
                        if (err.code === 11000) {
                            req.flash('error', 'Failure: Duplicated Images!');
                            res.redirect('/trades/new');
                        } else {
                            req.flash('error', 'Something went wrong');
                            res.redirect('/trades/new');
                        }
                    });
            });
            res.redirect('/trades');
        } else {
            req.flash('error', 'Starting price must be at least $1');
            res.redirect('/trades/new');
        }
    } else {
        req.flash('error', 'Please upload at least 1 image');
        res.redirect('/trades/new');
    }
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model
        .findById(id)
        .populate('trader', 'firstName lastName contact')
        .populate('bestBidder', 'firstName lastName')
        .populate('images', 'creator contentType imageBase64')
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
    let files = req.files;
    model
        .findByIdAndUpdate(id, trade, {
            useFindAndModify: false,
            runValidators: true,
        })
        .then((trade) => {
            if (trade) {
                let time = calculator.timeCalculation(trade);
                if (time.ms > 0 && trade.status == 'available') {
                    if (files.length >= 1) {
                        let imgArray = files.map((file) => {
                            let img = fs.readFileSync(file.path);

                            return (encode_image = img.toString('base64'));
                        });

                        imgArray.map((src, index) => {
                            // create object to store data in the collection
                            let finalImg = {
                                creator: req.session.user,
                                filename: files[index].originalname,
                                contentType: files[index].mimetype,
                                imageBase64: src,
                            };

                            new Image(finalImg)
                                .save()
                                .then((img) => {
                                    model
                                        .findByIdAndUpdate(trade._id, {
                                            $push: { images: img },
                                        })
                                        .catch((err) => next(err));
                                })
                                .catch((err) => {
                                    if (err.code === 11000) {
                                        req.flash('error', 'Failure: Duplicated Images!');
                                        res.redirect('/trades/' + id);
                                    } else {
                                        req.flash('error', 'Something went wrong');
                                        res.redirect('/trades/' + id);
                                    }
                                });
                        });
                        res.redirect('/trades/' + id);
                    }
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
    model
        .findByIdAndDelete(id, { useFindAndModify: false })
        .then((trade) => {
            if (trade) {
                trade.images.forEach((img) => {
                    Image.findOneAndDelete({ _id: img._id })
                        .then((img) => {
                            if (!img) {
                                let err = new Error('Cannot find a image with id ' + id);
                                err.status = 404;
                                next(err);
                            }
                        })
                        .catch((err) => next(err));
                });
                res.redirect('/trades');
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => next(err));
};
