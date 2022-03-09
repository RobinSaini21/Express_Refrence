const mongoose = require('mongoose');
let mongoUrl ='mongodb+srv://sahil:31839@cluster0.35uh3.mongodb.net/CIBO?retryWrites=true&w=majority';

let connectdb = async()=>{

    try{

      const con = await  mongoose.connect(mongoUrl,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        })

        console.log(`Connection Created`);

    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports=connectdb;

