
import multer from 'multer';
import path from 'path';
import fs from 'fs';


import dotenv from 'dotenv';
dotenv.config();

const storage = multer.diskStorage({
    destination: (req, file,cb)=>{
        const uploadsDir = path.join(process.cwd(), 'uploads'); //Creating a folder for uploads in current working directory
        //Check if uploads directory exists, if not create it
        if(!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir);
        }
        cb(null,uploadsDir) //Set the destination for the uploaded files
    },

    filename:(req,file,cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
        cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`)//Creating a unique suffix for the file name
    }
});



export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
    }
})