/* eslint-disable new-cap */
const mongoose = require('mongoose')
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        required: true
    },
    price: {
        type: String
    },
    item_picture: {
        type: String
    },
    active: {
        type: Number,
        enum: [0, 1],
        default: 0
    }

})

const Item = new mongoose.model('Item', itemSchema)

itemSchema.index({ item: 'text' })

module.exports = Item
