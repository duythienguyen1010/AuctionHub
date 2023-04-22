const Trade = require('../models/trade');
const User = require('../models/user');
const Offer = require('../models/offer');

//Check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//Check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }
};

//Check if user is trader of the trade
exports.isTrader = (req, res, next) => {
    let id = req.params.id;
    Trade.findById(id)
        .then((trade) => {
            if (trade) {
                if (trade.trader == req.session.user) {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            }
        })
        .catch((err) => next(err));
};

//Check if user is not the trader of the trade
exports.isNotTrader = (req, res, next) => {
    let id = req.params.id;
    Trade.findById(id)
        .then((trade) => {
            if (trade) {
                if (trade.trader !== req.session.user) {
                    return next();
                } else {
                    let err = new Error('Action unauthorized');
                    err.status = 401;
                    return next(err);
                }
            }
        })
        .catch((err) => next(err));
};

//Check if user is a party in the offer
exports.isParty = (req, res, next) => {
    let userId = req.session.user;
    let id = req.params.id;
    Offer.findById(id)
        .then((offer) => {
            if (userId == offer.creator || userId == offer.recipient) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        })
        .catch((err) => next(err));
};

//Check if user is the creator of the offer
exports.isCreator = (req, res, next) => {
    let userId = req.session.user;
    let id = req.params.id;
    Offer.findById(id)
        .then((offer) => {
            if (userId == offer.creator) {
                return next();
            } else {
                let err = new Error('Unauthorized action');
                err.status = 401;
                return next(err);
            }
        })
        .catch((err) => next(err));
};

//Check if user is the creator of the offer
exports.isRecipient = (req, res, next) => {
    let userId = req.session.user;
    let id = req.params.id;
    Offer.findById(id)
        .then((offer) => {
            if (userId == offer.recipient) {
                return next();
            } else {
                let err = new Error('Unauthorized action');
                err.status = 401;
                return next(err);
            }
        })
        .catch((err) => next(err));
};
