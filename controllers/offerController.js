const User = require('../models/user');
const Trade = require('../models/trade');

exports.new = (req, res, next) => {
    let itemId = req.params.id;
    let userId = req.session.user;
    Promise.all([User.findById(userId), Trade.find({ trader: userId, status: 'available' })])
        .then((result) => {
            const [user, trades] = result;
            Trade.findById(itemId)
                .populate('trader', 'firstName lastName')
                .populate('images', 'creator contentType imageBase64')
                .then((trade) => {
                    if (trade) {
                        if (trade.status == 'available') {
                            return res.render('./offer/new', {
                                user,
                                trades,
                                trade,
                            });
                        } else {
                            req.flash('error', 'this item is not available to bid at the moment');
                            res.redirect('/trades/' + itemId);
                        }
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

exports.create = (req, res, next) => {
    Trade.findById(req.params.id)
        .populate('trader')
        .then((trade) => {
            if (req.body.bidPrice > trade.bestPrice) {
                Trade.findByIdAndUpdate(req.params.id, { bestPrice: req.body.bidPrice }).catch(
                    (err) => next(err)
                );
                Trade.findByIdAndUpdate(req.params.id, { bestBidder: req.session.user }).catch(
                    (err) => next(err)
                );
                res.redirect('/trades/' + req.params.id);
            } else {
                req.flash('error', 'Bid price must be higher than the current best offer');
                res.redirect('/offers/' + req.params.id + '/new');
            }
        })
        .catch((err) => next(err));
};

exports.watch = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    Trade.findById(id)
        .then((trade) => {
            if (trade) {
                User.findById(userId)
                    .then((currentUser) => {
                        if (currentUser.watchlist.includes(id)) {
                            req.flash('error', 'this trade is already in your watchlist');
                            res.redirect('/trades/' + id);
                        } else {
                            User.findByIdAndUpdate(currentUser.id, {
                                $push: { watchlist: id },
                            }).catch((err) => next(err));
                            req.flash('success', 'trade added to your watchlist');
                            res.redirect('/trades/' + id);
                        }
                    })
                    .catch((err) => next(err));
            }
        })
        .catch((err) => next(err));
};

exports.updateWatch = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    Trade.findById(id)
        .then((trade) => {
            if (trade) {
                User.findById(userId)
                    .then((currentUser) => {
                        if (!currentUser.watchlist.includes(id)) {
                            req.flash('error', 'this trade is not in your watchlist');
                            res.redirect('/trades/' + id);
                        } else {
                            User.findByIdAndUpdate(currentUser.id, {
                                $pull: { watchlist: id },
                            }).catch((err) => next(err));
                            req.flash('success', 'trade removed from your watchlist');
                            res.redirect('/trades/' + id);
                        }
                    })
                    .catch((err) => next(err));
            }
        })
        .catch((err) => next(err));
};

exports.deny = (req, res, next) => {
    let id = req.params.id;
    Offer.findByIdAndUpdate(
        id,
        { status: 'denied' },
        { useFindAndModify: false, runValidators: true }
    )
        .then((offer) => {
            if (offer) {
                Trade.findByIdAndUpdate(offer.item1, { status: 'available' }).catch((err) =>
                    next(err)
                );
                Trade.findByIdAndUpdate(offer.item2, { status: 'available' }).catch((err) =>
                    next(err)
                );
                req.flash('success', 'Trade completed, status of items have been updated');
                res.redirect('/offers/' + id);
            } else {
                let err = new Error('Cannot find a offer with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => next(err));
};
