import fs from 'fs';
import Jimp = require('jimp');
import axios from 'axios';

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
export async function imageExists(imageUrl:any) {
    let exists;

    try {
        let response = await axios.head(imageUrl);
        exists = response.status === 200 && response.headers['content-type'].includes('image'); 
    } catch (e) {
        exists = false;
    }
    
    return exists;
}