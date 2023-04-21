const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    item: { type: Schema.Types.ObjectId, ref: 'Trade' },
    bid: { type: Number, required: [true, 'bid is required'], min: 1 },
    status: { type: String, required: [true, 'status is required'] },
});

//collection name is offers in the database
module.exports = mongoose.model('Offer', offerSchema);
