import path from 'path';
import express, { response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, imageExists, isValidImageFileExt, storage, fileFilter, getTempFiles, getUploadedFiles, requireAuth} from './util/util';
import multer from 'multer';

let appRoot = require('app-root-path');
let upload = multer({storage: storage, fileFilter: fileFilter});

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;
    
    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // GET /filteredimage?image_url={{URL}}
    // endpoint to filter an image from a public url.
    // PARAMS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

    app.get( "/filteredimage", requireAuth, async (request, response) => {
        let isValid, filteredImagePath;
        try {
            isValid = await imageExists(request.query.image_url);

            if (isValid) {
                filteredImagePath = await filterImageFromURL(request.query.image_url);
                response.sendFile(filteredImagePath);
            } else {
                return response.send('This is not a valid image');
            }
        } catch(e) {
            response.send(e);
        }
    });

    // POST /filter-image
    // endpoint to upload image and filter
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
    app.post(
        '/filter-image', 
        upload.single('file'),
        requireAuth,
        async (request, response) => {
            
            if (!request.file || !isValidImageFileExt(path.extname(request.file.originalname))) {
                return response
                    .status(403)
                    .contentType('text/plain')
                    .end('This is a not valid image file');
            }

            const filteredImagePath = await filterImageFromURL(path.join(appRoot.path, request.file.path));
            response.sendFile(filteredImagePath); 
        }
    )

    // POST /clear-files
    // endpoint to delete temp. and uploaded files
    // RETURNS
    //    String response
    app.post('/clear-files', requireAuth, async (request, response) => {
        deleteLocalFiles(getTempFiles());
        deleteLocalFiles(getUploadedFiles());
        response.send('All image files have been removed');
    });
    
    // Root Endpoint
    // Displays a simple message to the user
    app.get( "/", requireAuth, async ( req, res ) => {
        res.send("try GET /filteredimage?image_url={{}}")
    } );
  

  // Start the Server
    app.listen( port, () => {
        console.log( `server running http://localhost:${ port }` );
        console.log( `press CTRL+C to stop server` );
    } );
})();