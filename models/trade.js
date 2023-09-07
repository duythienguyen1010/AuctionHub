const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema(
    {
        title: { type: String, required: [true, 'title is required'] },
        images: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
        description: {
            type: String,
            required: [true, 'content is required'],
            minLength: [10, 'The description should have at least 10 characters'],
        },
        trader: { type: Schema.Types.ObjectId, ref: 'User' },
        initialPrice: { type: Number, required: [true, 'price is required'], min: 1 },
        bestBidder: { type: Schema.Types.ObjectId, ref: 'User' },
        bestPrice: { type: Number, required: [true, 'best price is required'], min: 1 },
        expiration: { type: Date, required: [true, 'time is required'], min: Date.now() },
        status: { type: String, required: [true, 'status is required'] },
    },
    { timestamps: true, get: (time) => time.toDateString() }
);

//collection name is trades in the database
module.exports = mongoose.model('Trade', tradeSchema);
