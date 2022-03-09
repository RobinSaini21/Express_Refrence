const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

});

const category = new mongoose.model("category",categorySchema);
module.exports = category;