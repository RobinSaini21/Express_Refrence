/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-trailing-spaces */
/* eslint-disable brace-style */
/* eslint-disable eqeqeq */
const customer = require('../model/signUp')
const Item = require('../model/items')
const cartItem = require('../model/cart')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const response = require('../Res/response')
require('dotenv').config()

const { body, validationResult } = require('express-validator')

exports.profile=(req, res)=>{
    customer.findOne({ _id: req.currentUser })
    .then(data=>{
            if (!data) {
                response.unauthorizedResponse(res, 'User not found')
            }
            else {
                const fulldata=({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    picture: data.picture,
                    user_type: data.user_type,
                    home_status: data.seller.home_status
                    })

                    response.successResponseWithData(res, 'User found', fulldata)
            }
        })
    .catch(err=>{
        response.ErrorResponse(res, 'errors found', err)
        })
}

exports.update=[
body('name').exists().withMessage('Name cannot be empty')
.isLength({ min: 3 }, { max: 15 }).isAlpha().withMessage('Name is not valid, Should be of 3 characters atleast'),

body('email', 'Email cannot be empty').exists()
.toLowerCase().isEmail().withMessage('Invalid email'),

body('phone').exists().withMessage(' Phone number cannot be empty')
.isLength({ min: 10, max: 10 }).isNumeric().withMessage('Invalid Phone number'),

(req, res)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        response.validationErrorWithData(res, 'Validation failed ', errors.array())
    }
    else {
        const id = req.currentUser

        customer.findOne({ _id: id }).exec()
        .then(data=>{
            if (!data) {
                response.unauthorizedResponseWithoutData(res, 'User not found')
            }
            else if (data.email===req.body.email) {
                customer.updateOne({ _id: id }, 
                {
                    $set: {
                
                        name: req.body.name,
                        phone: req.body.phone,
                        email: req.body.email,
                        profile_picture: (!req.files || Object.keys(req.files).length === 0)? '':req.files.profile_picture[0].filename
                
                    }
                }, { useFindandModify: false, new: true })
                    
                .then(data=>{
                    response.successResponseWithData(res, 'Data updated', data)
                    })
                
                .catch(err=>{
                    response.ErrorResponse(res, 'errors', err)
                    })
        }
        else {
            customer.findOne({ email: req.body.email }).exec()
            .then(user=>{
                if (user) {
                    response.validationErrorWithData(res, 'Validation Failed, Email is already in use', user.email)
                }
                else {
                    customer.updateOne({ _id: id }, 
                        {
                            $set: {
                        
                                name: req.body.name,
                                phone: req.body.phone,
                                email: req.body.email,
                                profile_picture: (!req.files || Object.keys(req.files).length === 0)? '':req.files.profile_picture[0].filename
                        
                            }
                        }, { useFindandModify: false, new: true })
                            .then(data=>{
                                response.successResponseWithData(res, 'Data updated', data)
                                })
                        
                            .catch(err=>{
                                response.ErrorResponse(res, 'errors', err)
                                })
                }
            }).catch(err=>{
                response.ErrorResponse(res, 'Errors ', err)
            })
        }
    })
    }
}
]

exports.changepassword=[
body('password').exists().withMessage('Please enter your Password')
.isLength({ min: 6 })
.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
.withMessage('Password must include one lowercase character, one uppercase character, a number, and a special character and should be of 6 characters at least.'),

body('old_password').exists().withMessage('Please enter your Password'),
body('confirmPassword').exists().withMessage('Fill your confirm password'),

(req, res)=>{
    const errors=validationResult(req)

    if (!errors.isEmpty()) {
        response.validationErrorWithData(res, 'Validation failed ', errors.array())
    } else {
        const id= req.currentUser

        customer.findOne({ _id: id })
        .then(data=>{
            bcrypt.compare(req.body.old_password, data.password, (_err, result)=>{
                if (!result) {
                    response.unauthorizedResponse(res, 'Old password is incorrect')
                } else {
                    if (req.body.password===req.body.old_password) {
                        response.validationError(res, 'Old and New password cannot be same')
                    } else {
                        if (req.body.password===req.body.confirmPassword) {
                            const bodydata ={
                                password: req.body.password,
                                confirmPassword: req.body.confirmPassword
                            }
                            bcrypt.hash(bodydata.password, 10, (err, hash)=>{
                            if (err) {
                                response.ErrorResponse(res, 'Error ', err)
                            } else {
                                console.log(hash)
                                // eslint-disable-next-line no-unused-expressions
                                bodydata.password= hash
                                bodydata.confirmPassword=hash

                                 customer.findByIdAndUpdate(id, bodydata, { new: true, useFindandModify: false })
                                .then(data=>{
                                      const fulldata=({
                                        name: data.name,
                                        email: data.email,
                                        phone: data.phone,
                                        picture: data.picture
                                        })

                                        response.successResponseWithData(res, 'Password is changed ', fulldata)
                                })
                                .catch((err)=>{
                                    response.ErrorResponse(res, 'errors', err)
                                })
                            }
                        })
                    } else {
                        response.validationError(res, 'Password and confirm password is not matched')
                    }
                 }
             }
         })
        })
        .catch(err=>{
            response.ErrorResponse(res, 'Error', err)
        })
    }
}
]

exports.confirm_password=(req, res)=>{
    res.render('newPassword', { email: req.params.email })
}

exports.forget_change_password=[
    body('name').exists().withMessage('Please enter your Name'),

    (req, res)=>{
        console.log(req.body.currentemail)

// The base64 encoded input string
const base64string =req.body.currentemail

// Create a buffer from the string
const bufferObj = Buffer.from(base64string, 'base64')

// Encode the Buffer as a utf8 string
const decodeEmail = bufferObj.toString('utf8')

console.log('The decoded string:', decodeEmail)

const bodydata ={
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
}

bcrypt.hash(bodydata.password, 10, (err, hash)=>{
    if (err) {
        console.log(err)
    }

        console.log(hash)
       // eslint-disable-next-line no-unused-expressions
       bodydata.password= hash
       bodydata.confirmPassword=hash

       customer.updateOne({ email: decodeEmail }, bodydata, { new: true, useFindandModify: false })
       .then(data=>{
           response.successResponseWithData(res, 'Password is changed', data)
       })
       .catch(err=>{
           response.ErrorResponse(res, 'Error', err)
       })
    })
}
]

exports.search_item=(req, res)=>{
    Item.find({ name: { $regex: ''+req.body.text+'', $options: 'i' } })
    .then(data=>{
        res.status(200).json({
            message: 'Data found',
            Data: data
        })
    })
    .catch(err=>{
        res.json({
            Error: err
        })
    })
}

exports.getNearByItems=(req, res)=>{
    try {
        Item.aggregate([
            {
                $lookup: {
                    from: 'customers',
                    let: { sellerId: '$seller_id' },
                    pipeline: [
                        {
                        $geoNear: {
                            near: { type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)] },
                            distanceField: 'dist.calculated',
                            minDistance: 700,
                            maxDistance: 1000,
                            includeLocs: 'dist.location',
                            spherical: true
                                    }
                        },
                        {
                        $match: {
                            $expr: { $eq: ['$_id', '$$sellerId'] }
                                }
                        }

                        ],

                    as: 'Seller'
                    }
                },
                        {
                            $unwind: '$Seller'
                        },
                        {
                            $project: {
                                seller_name: '$Seller.name',
                                Distance: '$Seller.dist.calculated',
                               // _id:1,
                                //item:1,
                                //category_id:1,
                                //seller_id:1,
                                image: 1,
                                price: 1,
                                name: 1

                            }
                        }, {
                            $sort: {
                               Distance: 1
                            }
                        }
        ])
        .then(success=>{
            return response.successResponseWithData(res, 'Data found', success)
        }).catch(err=>{
            response.ErrorResponse(res, 'Errors', err)
        })
    } 
    catch (error) {
        response.ErrorResponse(res, 'errors', error)
}
}

exports.logout=(req, res)=>{
    const token= req.headers.authorization

    jwt.destroy(token, 'SecretString').then(data=>{
        if (data) {
            res.status(200).json({
                message: 'You are logged out'
            })
        }
    }).catch(err=>{
        res.status(400).json({
            Error: err
        })
    })
}

exports.addToCart=(req, res)=>{
    Item.findOne({ name: req.body.name })
    .then(data=>{
        if (data) {
          const cartadd = new cartItem({
            
            item_id: data._id,
            name: data.name,
            price: data.price,
            seller_id: data.seller_id,
            customer_id: req.currentUser,
            item_picture: data.item_picture,
            quantity: req.body.quantity
          })

          cartadd.save(cartadd)
          .then(data=>{
              response.successResponseWithData(res, 'Items added to cart', data)
          }).catch(err=>{
            response.ErrorResponse(res, 'Errors', err)
          })
        } 
        else {
            response.notFoundResponseWithNoData(res, 'data not found')
        }
    })
    .catch(err=>{
        response.ErrorResponse(res, 'Errors', err)
    })
}

exports.myCart=(req, res)=>{
    cartItem.find({ customer_id: req.currentUser })
    .then(data=>{
        if (data==' ') {
            response.notFoundResponse(res, 'Cart is empty')
        }
        else {
            response.successResponseWithData(res, 'cart data', data)
        }
    })
    .catch(err=>{
        console.log(err)
        response.ErrorResponse(res, 'Error', err)
    })
}
