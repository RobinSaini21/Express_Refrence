const multer = require('multer')
const path = require('path')



const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'uploads/itemUploads');
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname));
    }
})

const upload=multer({
    storage:storage
})

module.exports= itemUploads=upload.fields([
    {
        name:'item_picture'
    }
  
])