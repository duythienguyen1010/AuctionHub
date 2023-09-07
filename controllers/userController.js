const model = require('../models/user');
const Trade = require('../models/trade');

exports.new = (req, res) => {
    res.render('./user/new');
};

exports.create = (req, res, next) => {
    let user = new model({
        id: '',
        firstName: '',
        lastName: '',
        contact: {
            phone: '',
            email: '',
        },
        profilePicture: '',
        password: '',
        watchlist: [],
    });
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.contact.phone = req.body.phone;
    user.contact.email = req.body.email;
    user.profilePicture = 'images/sample-profile.jpg';
    user.password = req.body.password;

    user.save() //insert the document to the database
        .then((user) => res.redirect('/users/login'))
        .catch((err) => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }

            if (err.code === 11000) {
                req.flash('error', 'Email has been used');
                return res.redirect('/users/new');
            }

            next(err);
        });
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
};

exports.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    model
        .findOne({ 'contact.email': email })
        .then((user) => {
            if (!user) {
                console.log('wrong email address');
                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            } else {
                user.comparePassword(password).then((result) => {
                    if (result) {
                        req.session.user = user._id;
                        req.flash('success', 'You have successfully logged in');
                        res.redirect('/users/profile');
                    } else {
                        req.flash('error', 'wrong password');
                        res.redirect('/users/login');
                    }
                });
            }
        })
        .catch((err) => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([
        model.findById(id),
        Trade.find({ trader: id }).populate('images', 'creator contentType imageBase64'),
        Trade.find({ bestBidder: id })
            .populate('trader', 'firstName lastName')
            .populate('images', 'creator contentType imageBase64'),
    ])
        .then((result) => {
            const [user, tradesMade, tradesBid] = result;
            console.log(user.watchlist);
            model
                .findById(user.id)
                .populate({ path: 'watchlist' })
                .exec(function (err, user) {
                    if (err) return next(err);
                    res.render('./user/profile', { user, tradesMade, tradesBid });
                });
        })
        .catch((err) => next(err));
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        else res.redirect('/');
    });
};
