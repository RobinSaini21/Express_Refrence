/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-trailing-spaces */
/* eslint-disable brace-style */
/* eslint-disable eqeqeq */
const customer = require('../model/signUp')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const response = require('../Res/response')
require('dotenv').config()

const { body, validationResult } = require('express-validator')

const nodemailer=require('nodemailer')

exports.login=[
    body('email').exists().withMessage('Please enter your Email')
        .isEmail().toLowerCase().withMessage('Invalid email address'),

    body('password').exists().withMessage('Please enter your Password'),

    (req, res)=>{
        const errors=validationResult(req)

        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, ' Validation Failed ', errors.array())
        } else {
        customer.findOne({ email: req.body.email }).exec()
        .then(user=>{
            if (!user) {
                response.unauthorizedResponse(res, 'User not found with email', req.body.email)
            } else {
                bcrypt.compare(req.body.password, user.password, (_err, result)=>{
                    if (!result) {
                       response.validationError(res, ' Incorrect Password ')
                    } else {
                   const token = jwt.sign(
                   {
                       id: user._id
                   },
                   process.env.SECRET_KEY,
                   {
                       expiresIn: '12hr'
                   }
                   )

                   const fulldata=({
                       name: user.name,
                       email: user.email,
                       token: token
                   })

               response.successResponseWithData(res, 'You are logged in', fulldata)
            }
})
            }
        }).catch(err =>{
            response.ErrorResponse(res, 'Could not entred', err)
        })
    }
}
]

exports.signUp= [

    body('name').exists().withMessage('Please enter your Name')
    .isLength({ min: 3 }, { max: 15 }).isAlpha().withMessage('Name is not valid, Should be of 3 characters atleast'),

    body('email').exists().withMessage('Please enter your Email')
    .toLowerCase()
    .isEmail().withMessage('Invalid email'),

    body('password').exists().withMessage('Please enter your Password')
    .isLength({ min: 6 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
    .withMessage('Password must include one lowercase character, one uppercase character, a number, and a special character and should be of 6 characters at least.'),

    body('phone').exists().withMessage('Please enter your Phone Number')
    .isLength({ min: 10, max: 10 }).withMessage('Invalid Phone number')
    .custom(value => {
        return customer.findOne({ phone: value })
           .then((data) => {
              if (data) {
                return Promise.reject('Phone number already taken')
              }
           })
     }),

(req, res)=>{
    const errors=validationResult(req)

        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, 'validation failed ', errors.array())
        } else {
        bcrypt.hash(req.body.password, 10, (err, hash)=>{
            if (err) {
                response.ErrorResponse(res, 'Hash error', err)
            } else {
                customer.findOne({ email: req.body.email })
                .then(data=>{
                    if (data) {
                        response.validationErrorWithData(res, 'Email is already taken', data.email)
                    } else {
                        const user = new customer({
                            name: req.body.name,
                            email: req.body.email,
                            phone: req.body.phone,
                            password: hash,
                            confirmPassword: hash,
                            location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] }
                            })

                        if (req.body.password==req.body.confirmPassword) {
                        user.save(user)
                        .then(data=>{
                            if (data) {
                                const token = jwt.sign(
                                    {
                                        id: data._id
                                    },
                                    process.env.SECRET_KEY,
                                    {
                                        expiresIn: '12hr'
                                    }
                                    )

                                    const fulldata=({
                                        name: data.name,
                                        email: data.email,
                                        token: token
                                    })

                                response.successResponseWithData(res, 'You are logged in', fulldata)
                            } else {
                                response.ErrorResponse(res, 'User not added')
                            }
                        })
                        .catch(err=>{
                             response.ErrorResponse(res, 'Error occured failed to add user', err)
                            })
                        } else {
                        response.unauthorizedResponseWithoutData(res, 'Confirm password is not matched')
                    }
                    }
                })
            }
        })
    }
}
]

exports.signUpwith = [
    body('login_type').exists().isNumeric().withMessage('Login type is empty'),
    body('googleId').trim(),
    body('facebookId').trim(),

    (req, res)=>{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, 'validatio Failed', errors.array())
        } 
        else {
            if (req.body.login_type==1) {
                if (!req.body.googleId) {
                    response.validationError(res, 'Google id is required, not valid')
                } else {
                    customer.findOne({ googleId: req.body.googleId }).exec()
                    .then(user=>{
                        if (user) {
                            const token = jwt.sign(
                                {
                                    id: user._id
                                },
                                process.env.SECRET_KEY,
                                {
                                    expiresIn: '12hr'
                                }
                                )

                            const fulldata =({
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                googleId: req.body.googleId,
                                location: user.location,
                                login_type: 1,
                                token: token
                            })
                            response.successResponseWithData(res, `Hello ${fulldata._id} Welcome back`, fulldata)
                        } else {
                            const newUser= new customer({
                                googleId: req.body.googleId
                            })
                            newUser.save(newUser)
                            .then(data=>{
                                const token = jwt.sign(
                                    {
                                        id: data._id
                                    },
                                    process.env.SECRET_KEY,
                                    {
                                        expiresIn: '12hr'
                                    }
                                    )

                                    const fulldata=({
                                        UserId: data._id,
                                        name: data.name,
                                        googleId: data.googleId,
                                        login_type: req.body.login_type,
                                        token: token
                                    })

                                response.successResponseWithData(res, 'Welcome, You are logged in with facebook', fulldata)
                            })
                        }
                    })
                }
            // eslint-disable-next-line eqeqeq
            } 
            else if (req.body.login_type == 2) {
                if (!req.body.facebookId) {
                    response.validationError(res, 'Facebook id is required')
                } else {
                    customer.findOne({ facebookId: req.body.facebookId }).exec()
                    .then(user=>{
                        if (user) {
                            const token = jwt.sign(
                                {
                                    id: user._id
                                },
                                process.env.SECRET_KEY,
                                {
                                    expiresIn: '12hr'
                                }
                                )

                            const fulldata =({
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                facebookId: req.body.facebookId,
                                location: user.location,
                                token: token
                            })
                            response.successResponseWithData(res, `Hello ${fulldata._id} Welcome back`, fulldata)
                        } else {
                            const newUser= new customer({
                                facebookId: req.body.facebookId
                            })
                            newUser.save(newUser)
                            .then(data=>{
                                const token = jwt.sign(
                                    {
                                        id: data._id
                                    },
                                    process.env.SECRET_KEY,
                                    {
                                        expiresIn: '12hr'
                                    }
                                    )

                                    const fulldata=({
                                        UserId: data._id,
                                        name: data.name,
                                        facebookId: data.facebookId,
                                        token: token
                                    })

                                response.successResponseWithData(res, 'Welcome, You are logged in with facebook', fulldata)
                            })
                        }
                    })
                }
            } 
            else {
                response.validationError(res, 'Login type is not valid')
            }
        }
}
]

 exports.signUp_seller=[

    body('pan_number').exists().withMessage('Please enter your Pan Card number')
    .trim().isNumeric().isLength({ max: 10, min: 10 }).withMessage('Pan number is not valid')
    .custom(value => {
        return customer.findOne({ 'seller.pan_number': value })
           .then((data) => {
              if (data) {
                return Promise.reject('Pan number already taken')
              }
           })
     }),

    body('adhar_number').exists().withMessage('Please enter your Aadhar Card number')
    .trim().isNumeric().isLength({ max: 12, min: 12 }).withMessage('Aadhar number is not valid')
    .custom(value => {
        return customer.findOne({ 'seller.adhar_number': value })
           .then((data) => {
              if (data) {
                return Promise.reject('Adhar number already taken')
              }
           })
     }),

    body('street_name').exists().withMessage('Please enter your address')
    .trim().isLength({ min: 10 }).withMessage('Address is not valid'),

    body('city').exists().withMessage('Please enter your City')
    .trim().isLength({ min: 3 }).withMessage('City is not valid'),

    body('state').exists().withMessage('Please enter your State')
    .trim().isLength({ min: 3 }).withMessage('State name is not valid'),

    body('pin').exists().withMessage('Please enter Pin Code')
    .trim().isLength({ max: 6, min: 6 }).withMessage('Pin Code is not valid'),

    (req, res)=>{
        const errors=validationResult(req)

        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, 'Validation failed', errors.array())
        } else {
            console.log('req.currentUser', req.currentUser)

            customer.findOne({ _id: req.currentUser })
            .then(data=>{
                console.log(data.user_type)
                console.log(data)
              if (!data) {
                    response.unauthorizedResponseWithoutData(res, 'Please sign up as customer first')
                }
                else {
                    if (data.user_type==1) {
                        response.validationError(res, 'You are already a seller', data.seller)
                    }
                else {
                    customer.updateOne({ _id: req.currentUser }, {

                    user_type: 1,    
                    seller: {
                        pan_number: req.body.pan_number,
                        adhar_number: req.body.adhar_number,
                        address: {
                            street_name: req.body.street_name,
                            city: req.body.city,
                            state: req.body.state,
                            pin: req.body.pin
                        },
                        home_status: 1,
                        account_activation: 0,
                        subscription: 0
                    }
                    })
                    .then(data =>{
                        if (data) {
                            response.successResponseWithData(res, 'Seller id is added', data)
                        } else {
                            response.ErrorResponseWithoutData(res, 'Seller information is not added ')
                        }
                    })
                    .catch(err=>{
                        response.ErrorResponse(res, 'error occured', err)
                    })
                } 
            }
            })
        }
    }
]

exports.forget_password=[
    body('email').exists().withMessage('Please enter your Email')
    .isEmail().toLowerCase().withMessage(' Invalid email address'),

    (req, res)=>{
        const errors=validationResult(req)

        if (!errors.isEmpty()) {
            response.validationErrorWithData(res, 'Validation Failed', errors.array())
        } else {
            console.log(req.body.email)
            const email= req.body.email

            // The original utf8 string
            const originalString = req.body.email

            // Create buffer object, specifying utf8 as encoding
            const bufferObj = Buffer.from(originalString, 'utf8')

            // Encode the Buffer as a base64 string
            const base64String = bufferObj.toString('base64')

            console.log('The encoded base64 string is:', base64String)

            customer.findOne({ email: email }).then(data=>{
                if (data) {
                    const transport = nodemailer.createTransport({
                        port: 2525,

                        host: 'smtp.mailtrap.io',
                      auth: {
                        user: '40d7706843bef2',
                        pass: 'ffb6a55e978800'
                      }
                       })

                       const mailOptions = {

                           from: 'sfs.priyanka19@gmail.com',
                           to: req.body.email,

                           subject: 'FORGET PASSWORD',
                           html: 'Click on this link to change your passsword <a href=http://localhost:3030/api/user/confirm-password/'+ base64String +'>CLICK</a>'
                       }

                       transport.sendMail(mailOptions, (err, result)=>{
                           console.log('static error.......', err)

                           if (err) {
                               res.json({

                                   message: 'Mail not sent',
                                   Error: err
                               })
                           } else {
                               res.status(200).json({
                                   message: 'Mail has been sent to your E-mail account '
                               })
                           }
                       })
                } else {
                    res.status(400).json({
                        message: 'user not found '
                    })
                }
            }).catch(err=>{
                res.status(401).json({
                    errors: err
                })
            })
        }
}
]
