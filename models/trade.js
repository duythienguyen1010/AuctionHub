const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema(
    {
        title: { type: String, required: [true, 'title is required'] },
        images: { type: Array, required: [true, 'image is required'] },
        description: {
            type: String,
            required: [true, 'content is required'],
            minLength: [10, 'The description should have at least 10 characters'],
        },
        trader: { type: Schema.Types.ObjectId, ref: 'User' },
        category: { type: String, required: [true, 'category is required'] },
        status: { type: String, required: [true, 'status is required'] },
    },
    { timestamps: true, get: (time) => time.toDateString() }
);

//collection name is trades in the database
module.exports = mongoose.model('Trade', tradeSchema);
