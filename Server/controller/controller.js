/* eslint-disable camelcase */
/* eslint-disable new-cap */
/* eslint-disable no-trailing-spaces */
/* eslint-disable brace-style */
/* eslint-disable eqeqeq */
const category= require('../model/categories')

require('dotenv').config()

const { body, validationResult } = require('express-validator')

exports.add_category=[
    body('cat_name').exists().isLength({ min: 3 }).withMessage('Category name cannnot be empty and should contain 3 characters atleast'),

    (req, res)=>{
        const errors=validationResult(req)

        if (!errors.isEmpty()) {
            res.send({
                status: 400,
                message: errors.array()
            })
        } else {
            const newCat = new category({
                name: req.body.cat_name
            })

            newCat.save(newCat)
            .then(data=>{
                res.status(200).json({
                    message: 'category is added',
                    name: data
                })
            })

            .catch(err=>{
                res.status(400).json({
                   Error: err
                })
            })
        }
}
]
