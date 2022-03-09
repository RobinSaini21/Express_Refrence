/* eslint-disable new-cap */
const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        required: true
    },
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'items',
        required: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        required: true
    },
    item_picture: {
        type: String
    },
    quantity: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }

})

const cartItem = new mongoose.model('Cart', cartSchema)

module.exports = cartItem
