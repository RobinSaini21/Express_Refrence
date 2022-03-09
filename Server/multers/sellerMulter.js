const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads/sellerUploads');
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+path.extname(file.originalname));
    }
})

const upload=multer({
    storage: storage
})

module.exports= sellerUploads=upload.fields([
    {
        name: 'picture'
    },
    {
        name: 'pan_picture'
    },
    {
        name: 'adhaar_front'
    },
    {
        name: 'adhaar_back'
    }
])