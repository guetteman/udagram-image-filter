# Udagram Image Filtering Microservice

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

The Image Filtering Microservice is a Node-Express application which runs a simple script to process images.

There are 3 main endpoints:

1.  `/filteredimage?image_url={{URL}}`: it is used to filter an image from a given URL.
2.  `/filter-image`: it filters and uploaded image.
3.  `/clear-files` it remove the temporary and uploaded images.

Also, an `authorization` header was added to these 3 endpoints, in the source code you can find a postman json collection so you can test.

Finally, you can enter to [http://img-filter.guetteluis.com](http://img-filter.guetteluis.com) to test the api.

Thanks!