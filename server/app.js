const path = require('path');
const cors = require("cors");
const helmet = require('helmet');
const ytdl = require('ytdl-core');
const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const yts = require("youtube-search-api");

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
        // store result from api in 'results'
        // query : search term
        // fasle : for general search, true for playlist only
        // 1     : number of results
        const results = await yts.GetListByKeyword(query, false,1);
        if(results.items.length === 0) return res.status(404).send("No results found.");

        // get first result from list
        const video = results.items[0];
        
        // construct the url and send result
        res.json({
            title:video.title,
            url:`https://www.youtube.com/watch?v=${video.id}`
        });
    }catch{
        // return any error occurance
        res.status(500).send(`Error searching videos: ${error}`);
    }
});


// handle '/download' url endpoint
app.get('/download', (req,res) => {
    // get url parameter from query
    const videoUrl = req.query.url;
    // ensure url is provided
    if(!videoUrl) return res.status(400).send("Query parameter 'url' required");

    // Ensure the URL is properly formatted
    if (!videoUrl.startsWith('https://')) {
        // If the URL doesn't start with 'https://', add it
        videoUrl = `https://${videoUrl.split('://')[1] || videoUrl}`; // handle missing protocol gracefully
    }

    
    const outputDir = 'downloads'
    const command = `yt-dlp -x --audio-format mp3 -o "${outputDir}/%(title)s.%(ext)s" "${videoUrl}"`
    // description:
    // -x                                  : extract audio from the video file
    // --audio-formt mp3                   : convert formt to mp3 
    // -o "${outputDir}/%(title)s.%(ext)s" : save file in doenload folder with title as name of file
    // "${videoUrl}"                       : url of which video is to be downloaded

    // exec command to run terminal scripts. 
    // command - actual command
    // stdout  - resultant message from command
    // stderr  - errors or warning from command
    // err     - error handling in js
    exec(command, (error,stdout,stderr) => {
        if(error){
            console.log("Error:",error)
            return res.status(500).send(`Error downloading video: ${stderr}`)
        }
        
        // stdout contains all output message of yt-dlp command.
        // file path is present in following format
        //      Destination : downloads/songname.mp3
        // use regex to extract the name
        const filename = stdout.match(/Destination: (.+\.mp3)/)?.[1]
        if (!filename) return res.status(500).send("Error identifying downloaded file.");

        // create an absolute path to the file for sending to client
        const filepath = path.resolve(outputDir,filename);

        // set content disposition in header
        // tells browser its a file being sent
        // path.basename(filepath) extracts filename from path and set it as filename parameter
        res.setHeader('Content-Disposition',`attachment; filename="${path.basename(filepath)}"`)
        // send file to client
        res.download(filepath, (error) => {
            if(error){
                console.error("Error sending file:",error);
                res.status(500).send("Error sending file.");
            }
        });


    });
    //exec(command,callback) : handles yt-dlp in terminal. handles errors
});

// start server. listen for request
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})