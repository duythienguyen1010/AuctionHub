const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');
const userSchema = new Schema({
    firstName: { type: String, required: [true, 'first name is required'] },
    lastName: { type: String, required: [true, 'last name is required'] },
    contact: {
        email: {
            type: String,
            required: [true, 'email address is required'],
            unique: [true, 'this email address has been used'],
        },
        phone: { type: String, required: [true, 'phone number is required'] },
    },
    password: { type: String, required: [true, 'password is required'] },
    profilePicture: { type: String },
    watchlist: { type: [Schema.Types.ObjectId], ref: 'Trade' },
});

userSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password')) return next();
    bcrypt
        .hash(user.password, 10)
        .then((hash) => {
            user.password = hash;
            next();
        })
        .catch((err) => next(error));
});

userSchema.methods.comparePassword = function (inputPassword) {
    let user = this;
    return bcrypt.compare(inputPassword, user.password);
};

//collection name is users in the database
module.exports = mongoose.model('User', userSchema);
