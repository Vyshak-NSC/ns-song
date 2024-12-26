// initiate compoents
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultDiv = document.getElementById('results')

// This is where you define the URL for your backend
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Use localhost when working on your computer
    : 'https://your-app.onrender.com'; // Use the live URL on Render

//add event listener to search button
searchBtn.addEventListener('click', async function(){
    try{
        // read query value from search-bar input element, store it in query, then reset the value of element
        const query = searchInput.value;
        searchInput.value = '';
        
        // create a componnt for result
        const result = document.createElement('div')
        result.setAttribute('class','result-item');

        // search for song and parse json
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
        const data = await response.json();
        
        // display the search result with title
        // add button allows to save teh song
        // download adds it to device storage
        result.innerHTML = `
            <p>Title: ${data.title}</p>
            <div>
                <button class="btn add-btn" data-info="${JSON.stringify(data)} >Add</button>
                <button class="btn download-btn">Download</button>
            </div>
        `
        // append component to display
        resultDiv.appendChild(result)

         // add event listener for download button
        const downloadBtn = result.querySelector('.download-btn');
        downloadBtn.addEventListener('click', function(){
            downloadSong(data.url)
        });

    }catch(error){
        console.error("Error fetching search rsult:",error)
    }
    
})

// handles download of song
async function downloadSong(videoUrl){
    try{
        // request for file with url as parameter
        const response = await fetch(`http://localhost:3000/download?url=${encodeURIComponent(videoUrl)}`);
        if(!response.ok) throw new Error("Failed to download.");

        // get filename from content disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        // default name
        let filename = 'donloaded_song.mp3'
        
        // if(contentDisposition && contentDisposition.includes('filename=')){
        //     filename = contentDisposition.split('filename=')[1].replace(/"/g, '')
        // }

        // create a blob - Binary Large Object
        // used in handling audio, video or images
        const blob = await response.blob();

        // create a download link
        // set its url as the blob url
        const downloadLink = document.createElement('a');
        // URL.createObjectURL - converts blob to a temporary url for browser to access
        downloadLink.href = URL.createObjectURL(blob)

        // make the link part of page. then trigger its click function. then remove the link from body
        document.body.appendChild(downloadLink)
        downloadLink.click();
        document.body.removeChild(downloadLink)
        // performed due to restriction on auto download without user input

        console.log('Download complete',message)
    }catch(error){
        console.error("Error:",error)
    }
}
