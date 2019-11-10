import path from 'path';
import express, { response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, imageExists, isValidImageFileExt, storage, fileFilter} from './util/util';
import multer from 'multer';
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

    app.get( "/filteredimage", async (request, response) => {
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
    // upload image and filter
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
    app.post(
        '/filter-image', 
        upload.single('file'),
        async (request, response) => {
            
            if (!request.file || !isValidImageFileExt(path.extname(request.file.originalname))) {
                return response
                    .status(403)
                    .contentType('text/plain')
                    .end('This is a not valid image file');
            }

            const filteredImagePath = await filterImageFromURL(path.join(__dirname, '../', request.file.path));
            response.sendFile(filteredImagePath); 
        }
    )

    // Root Endpoint
    // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
      res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
    app.listen( port, () => {
        console.log( `server running http://localhost:${ port }` );
        console.log( `press CTRL+C to stop server` );
    } );
})();