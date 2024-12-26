const path = require('path');
const cors = require("cors");
const helmet = require('helmet');
const ytdl = require('ytdl-core');
const express = require("express");
const bodyParser = require("body-parser");

const app = express()
const port = 3000

// ensure accessibility from other origin - eg: frontend app on diferent domain
app.use(cors());
// secure http headers
app.use(helmet());
// allows parsing json
app.use(bodyParser.json());
// serve frontedn files
app.use(express.static(path.join(__dirname, "public")));

const allowedOrigins = ['https://ns-song-ejb1.onrender.com']; // Add your frontend domain here

// Enable CORS for your frontend domain
app.use(cors({
  origin: allowedOrigins,  // Allows only the frontend domain
  methods: ['GET', 'POST'],  // Specify allowed HTTP methods
}));


// handle '/search' url endpoint
app.get('/search', async(req,res) => {
    // get query parameter q
    // input as '.../search?q=<value>
    const query = req.query.q;

    // ensure parameter 'q' is provided
    if(!query) returnres.status(400).send("Query parameter 'q' required");

    try{
        // search video with ytdl and store in results
        const results = await ytdll.getInfo(query)
        if(!results) return res.status(404).send("No results found");

        // extract video details
        const video = results.videoDetails;
        //send title and url to user
        res.json({
            title:video.title,
            url:`https://www.youtube.com/watch?v=${video.videoId}`
        });

    }catch(errror){
        // return any error occurance
        res.status(500).send(`Error searching videos: ${error.message}`);
    }
});


// handle '/download' url endpoint
app.get('/download', async (req,res) => {
    // get url parameter from query
    const videoUrl = req.query.url;
    // ensure url is provided
    if(!videoUrl) return res.status(400).send("Query parameter 'url' required");
    // Ensure the URL is properly formatted
    if (!videoUrl.startsWith('https://')) {
        // If the URL doesn't start with 'https://', add it
        videoUrl = `https://${videoUrl.split('://')[1] || videoUrl}`; // handle missing protocol gracefully
    }
    try{
        const info = await ytdl.getInfo(videoUrl);
        const audioFormat = ytdl.chooseFormat(info.formats, {quality:'highestaudio'});

        if(!audioFormat) return res.status(500).send("No audio format available");

        res.setHeader('Content-Disposition', `attachment; filename='${info.videoDetails.title}.mp3`);
        res.setHeader('Content-Type','audio/mpeg');
        ytdl(videoUrl, {format:audioFormat}).pipe(res);
    }catch{
        res.status(500).send("Error downloading video:",error.message)
    }
    
});

// start server. listen for request
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})