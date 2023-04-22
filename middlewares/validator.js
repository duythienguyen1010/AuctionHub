const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid id');
        err.status = 400;
        return next(err);
    }
};

exports.validateSignUp = [
    body('firstName', 'First name can not be empty').notEmpty().trim().escape(),
    body('lastName', 'Last name can not be empty').notEmpty().trim().escape(),
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('phone', 'phone can not be empty').notEmpty().trim().escape(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({
        min: 8,
        max: 64,
    }),
];

exports.validateLogin = [
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({
        min: 8,
        max: 64,
    }),
];

let currentTime = new Date();
let expirationDate = new Date();
expirationDate.setMonth(expirationDate.getMonth() + 1);
currentTime = currentTime.toString();
expirationDate = expirationDate.toString();

exports.validateTrade = [
    body(
        'expiration',
        'expiration date can not be less than the current time or more than one month away'
    )
        .notEmpty()
        .isAfter(currentTime)
        .isBefore(expirationDate)
        .trim()
        .escape(),
    body('itemName', 'Item name can not be empty').notEmpty().trim().escape(),
    body('description', 'Description must be at least 10 characters long')
        .isLength({ min: 10 })
        .trim()
        .escape(),
    body('initialPrice', 'Starting price is required').notEmpty().trim().escape(),
];

exports.validateEditTrade = [
    body(
        'expiration',
        'expiration date can not be less than the current time or more than one month away'
    )
        .notEmpty()
        .isAfter(currentTime)
        .isBefore(expirationDate)
        .trim()
        .escape(),
    body('itemName', 'Item name can not be empty').notEmpty().trim().escape(),
    body('description', 'Description must be at least 10 characters long')
        .isLength({ min: 10 })
        .trim()
        .escape(),
];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
};
