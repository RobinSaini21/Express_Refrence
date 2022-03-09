const express = require('express')
const controller = require('../controller/controller')

const middleware = require('../middlewares/middleware')
const sellerUploads=require('../multers/sellerMulter')
const itemUploads =require('../multers/itemMulter')
const profileUploads = require('../multers/profileMulter')
const authController = require('../controller/authController')
const customController= require('../controller/customController')
const sellerController = require('../controller/sellerController')
const route = express.Router()

//API Routes

//User

route.post('/api/user/login', authController.login)

route.post('/api/user/sign-up', authController.signUp)

route.post('/api/user/sign-up/google-facebook', authController.signUpwith)

route.get('/api/user/get-profile', middleware.authorization, customController.profile)

route.post('/api/user/update', profileUploads, middleware.authorization, customController.update)

route.post('/api/user/change-password', middleware.authorization, customController.changepassword)

route.post('/api/user/forget-password', authController.forget_password)

route.get('/api/user/confirm-password/:email', customController.confirm_password)

route.post('/api/user/forget-change-password', customController.forget_change_password)

route.post('/api/user/search-item', customController.search_item)

route.get('/api/user/search-items-nearby', customController.getNearByItems)

route.get('/api/user/logout', middleware.authorization, customController.logout)

route.post('/api/user/add-to-cart', middleware.authorization, customController.addToCart)

route.get('/api/user/my-cart', middleware.authorization, customController.myCart)

//Seller

route.post('/api/seller/signUp', sellerUploads, middleware.authorization, authController.signUp_seller)

route.post('/api/admin/add-category', controller.add_category)

route.post('/api/seller/add-item', itemUploads, middleware.authorization, sellerController.add_item)

route.get('/api/seller/get-category', middleware.authorization, sellerController.get_category)

route.get('/api/seller/get-item', middleware.authorization, sellerController.get_items)

route.post('/api/seller/add-account-details', middleware.authorization, sellerController.account_details)

route.post('/api/seller/add-subscription', middleware.authorization, sellerController.subscription)

route.get('/api/seller/available-staus', middleware.authorization, sellerController.seller_avail_status)

module.exports=route
