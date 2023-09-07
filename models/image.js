const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    filename: {
        type: String,
        unique: true,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    imageBase64: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Image', imageSchema);
