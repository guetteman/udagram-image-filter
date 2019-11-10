import fs from 'fs';
import Jimp = require('jimp');
import axios from 'axios';
import path from 'path';
import { NextFunction, Request, Response } from 'express';

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

export function fileFilter (req:any, file:any, cb:any) {
    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
    // To reject this file pass `false`, like so:
    if (!file || !isValidImageFileExt(path.extname(file.originalname))) {
        cb(null, false)
    } else {
        cb(null, true)
    }
  }


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

const TEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsIm5hbWUiOm51bGwsImdpdmVuX25hbWUiOm51bGwsImZhbWlseV9uYW1lIjpudWxsLCJtaWRkbGVfbmFtZSI6bnVsbCwibmlja25hbWUiOm51bGwsInByZWZlcnJlZF91c2VybmFtZSI6bnVsbCwicHJvZmlsZSI6bnVsbCwicGljdHVyZSI6bnVsbCwid2Vic2l0ZSI6bnVsbCwiZW1haWwiOm51bGwsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ2VuZGVyIjpudWxsLCJiaXJ0aGRhdGUiOm51bGwsInpvbmVpbmZvIjpudWxsLCJsb2NhbGUiOm51bGwsInBob25lX251bWJlciI6bnVsbCwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwiYWRkcmVzcyI6bnVsbCwidXBkYXRlZF9hdCI6MH0.rvINF7r3HDoIl8jwHYPxK23TSx90eOkLilyCYrzPRqY';

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

// getTempFiles
// helper function to get temp files on the local disk
// RETURNS
//    Array<string> an array of absolute paths to files
export function getTempFiles () {
    return getDirectoryContent(path.join(__dirname, 'tmp')).map(file => {
        return path.join(__dirname, 'tmp', file);
    });
}

// getUploadedFiles
// helper function to get uploaded files on the local disk
// RETURNS
//    Array<string> an array of absolute paths to files
export function getUploadedFiles () {
    return getDirectoryContent(path.join(__dirname, '../../', 'uploads')).map(file => {
        return path.join(__dirname, '../../', 'uploads', file);
    });
}

// getDirectoryContent
// helper function to get files on a directory
// INPUTS
//    directoryPath: String with the directory absolute path;
// RETURNS
//    Array<string> an array of absolute paths to files
function getDirectoryContent (directoryPath:string) {
    return fs.readdirSync(directoryPath);
}

// requireAuth
// middleware to check if user is authenticated
// INPUTS
//    request: Request;
//    response: Response;
//    next: NextFunction;
// RETURNS
//    next method
export function requireAuth (request: Request, response: Response, next: NextFunction) {
    if (!request.headers || !request.headers.authorization) {
        return response.status(401).send({ message: 'No authorization header.' })
    }

    const tokenBearer = request.headers.authorization.split(' ')[1];

    if (tokenBearer !== TEST_TOKEN) {
        response.status(500).send('Failed to authenticate');
    } else {
        next();
    }
}