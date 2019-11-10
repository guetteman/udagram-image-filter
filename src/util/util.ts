import fs from 'fs';
import Jimp = require('jimp');
import axios from 'axios';

import multer from 'multer';
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        var filetype = '';

        if (VALID_IMAGE_FORMATS.includes(file.mimetype)) {
            filetype = file.mimetype.split('/')[1];
        }
        
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});


export const VALID_IMAGE_FORMATS = [
    'image/gif',   
    'image/jpeg',   
    'image/png',   
    'image/tiff', 
    'image/bmp' 
]

export const VALID_IMAGE_FILE_EXTENSIONS = [
    '.gif',   
    '.jpeg',   
    '.png',   
    '.tiff', 
    '.bmp' 
]

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        const photo = await Jimp.read(inputURL);
        const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
        await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(__dirname+outpath, (img)=>{
            resolve(__dirname+outpath);
        });
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}

// imageExists
// helper function to check if image exists and is valid
// INPUTS
//    imageUrl: String image url;
// RETURNS
//    a Boolean
export async function imageExists(imageUrl:string) {
    let exists;

    try {
        let response = await axios.head(imageUrl);
        exists = response.status === 200 && isValidImageFormat(response.headers['content-type']); 
    } catch (e) {
        exists = false;
    }
    
    return exists;
}

// isValidImageExt
// helper function to check if image file extension is valid
// INPUTS
//    fileExt: String file extension;
// RETURNS
//    a Boolean
export function isValidImageFileExt (fileExt:string) {
    return VALID_IMAGE_FILE_EXTENSIONS.includes(fileExt);
}

// isValidImageFormat
// helper function to check if image header format is valid
// INPUTS
//    format: String 'content-type' header;
// RETURNS
//    a Boolean
function isValidImageFormat (format:string) {
    return VALID_IMAGE_FORMATS.includes(format);
}