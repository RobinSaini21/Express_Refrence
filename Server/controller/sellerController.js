/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-trailing-spaces */
/* eslint-disable brace-style */
/* eslint-disable eqeqeq */

const category= require('../model/categories')
const Item = require('../model/items')
require('dotenv').config()
const response = require('../Res/response')
const mongoose = require('mongoose')

const { body, validationResult } = require('express-validator')
const customer = require('../model/signUp')

exports.account_details=[
    body('account_number').trim().exists().isNumeric().withMessage('Account number is not valid'),
    body('bank_name').trim().exists().isAlpha().withMessage('Bank name is not valid'),
    body('branch_code').trim().exists().isNumeric().withMessage('Branch code id not valid'),
    body('tc').trim().exists().isNumeric().withMessage('Term and condition are not agreed'),

    (req, res)=>{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, 'Validation failed', errors.array())
        }
        else {
            customer.findOne({ _id: req.currentUser }).exec()
            .then(data=>{
                if (!data) {
                    response.unauthorizedResponseWithoutData(res, 'User not found')
                }
                else {
                    if (data.user_type== 1) {
                        customer.updateOne({ _id: req.currentUser },
                            {
                                $set: {
                                'seller.accoun_details.account_number': req.body.account_number,
                                'seller.accoun_details.bank_name': req.body.bank_name,
                                'seller.accoun_details.branch_code': req.body.branch_code,
                                'seller.accoun_details.tc': req.body.tc
                            }
                        }, { useFindandModify: false, new: true })
                        .then(data=>{
                            response.successResponseWithData(res, 'Account details are added', data.email)
                        })
                        .catch(err=>{
                            response.ErrorResponse(res, 'Details are not added', err)
                        })
                }
                    else {
                    response.unauthorizedResponse(res, 'You dont have a seller profile', data.email)
                }
            }
        })
    }
}
]

exports.subscription=(req, res)=>{
    
}

exports.add_item=[
    body('item_name').exists().withMessage('Please enter a valid name for this item')
    .isLength({ min: 3 }).withMessage('Item name cannot be empty and must contain 3 characters atleast'),

    body('cat_name').isAlpha().exists().withMessage('Select category for this item'),
    
    body('price').exists().isNumeric().withMessage('Please enter price, should be numeric'),

    (req, res)=>{
        const errors=validationResult(req)

        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, 'Validation failed', errors.array())
        }
        else {
            customer.findOne({ _id: req.currentUser }).exec()
            .then(data=>{
                if (!data) {
                    response.unauthorizedResponseWithoutData(res, 'User not found')
                }
                else if (data.user_type==1) {
                        category.findOne({ name: req.body.cat_name })
                        .then(data=>{
                            if (!data) {
                                response.notFoundResponse(res, 'Category not found', req.body.cat_name)
                            } 
            
                            else {
                                // eslint-disable-next-line no-undef
                                cat_id = data._id
            
                                const newItem2= new Item({
            
                                    name: req.body.item_name,
                                    // eslint-disable-next-line no-undef
                                    category_id: cat_id,
                                    seller_id: req.currentUser,
                                    price: req.body.price,
                                    item_picture: (!req.files || Object.keys(req.files).length === 0)? '':req.files.item_picture[0].filename,
                                    active: 1
                                })
            
                            newItem2.save(newItem2)
                            .then(data=>{
                                response.successResponseWithData(res, 'Item is added', data)
                            })
                            .catch(err=>{
                                response.ErrorResponse(res, 'Failed to add item', err)
                        })
                    }
                })
                .catch(err=>{
                    response.ErrorResponse(res, 'errors', err)
                })
                }
                else {
                    response.validationErrorWithData(res, 'You dont have a seller profile yet', data.email)
                }
            })
        }
}
]

exports.get_category=(req, res)=>{
    category.find()
    .then(data=>{
        if (data) {
            res.status(200).json({
                Data: data
            })
        } else {
            res.status(400).json({
                message: 'data not found'
            })
        }
    })
    .catch(err=>{
        res.status(400).json({
            Error: err
        })
    })
}

exports.get_items=(req, res)=>{
console.log('Currebt user.........', req.currentUser)

    Item.find({ seller_id: req.currentUser })
        .then(data=>{
            if (data) {
                res.status(200).json({
                Data: data
                })
            } else {
            res.status(400).json({
                message: 'data not found'
                })
            }
        })
        .catch(err=>{
            res.status(400).json({
            Error: err
            })
        })
}

exports.seller_avail_status=(req, res)=>{
    customer.findOne({ _id: req.currentUser }).exec()
        .then(user=>{
            if (!user) {
                response.notFoundResponse(res, 'User not found ', user)
            }
            else if (!user.user_type==1) {
                response.unauthorizedResponse(res, 'You are not registered to a seller account')
            }
            else {
                console.log(user.seller.home_status)
                if (user.seller.home_status==1) {
                    customer.updateOne({ _id: req.currentUser }, {
                        $set: {
                            'seller.home_status': 0
                            }
                        }, 
                        { useFindandModify: false, new: true })
                    .then(data=>{
                        response.successResponse(res, 'Status changed to 0, You are offline now', data)
                    })
                    .catch(err=>{
                        response.ErrorResponse(res, 'Errors', err)
                    })
                }
                else {
                    customer.updateOne({ _id: req.currentUser }, {
                        $set: {
                            'seller.home_status': 1
                            }
                        },
                        { useFindandModify: false, new: true })
                    .then(data=>{
                        Item.aggregate([
                        {
                            $match: {
                                $and: [{ seller_id: mongoose.Types.ObjectId(req.currentUser) }]
                            }
                        },
                        {
                            $lookup: {
                                from: 'categories',
                                as: 'categories',
                                let: { categoryId: '$category_id' },
                                pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                        $and: [
                                                        { $eq: ['$_id', '$$categoryId'] }
                                                        ]
                                                    }
                                                }
                                        }
                                    ]
                                }
                        },
                        {
                            $unwind: '$categories'
                        },
                        {
                            $project: {
                                name: 1,
                                category_name: '$categories.name',
                                price: 1,
                                active: 1
                            }
                        }
                        ])
                        .then(fulldata=>{
                            response.successResponseWithData(res, 'Items found', fulldata)
                        })
                        .catch(err=>[
                            response.ErrorResponse(res, 'Errors', err)
                        ])
                })
        .catch(err=>{
                    response.ErrorResponse(res, 'Errors', err)
        })
        }
        }
    })
}
