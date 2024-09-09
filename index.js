require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');
const cache = require('memory-cache');

// Basic Configuration
const port = process.env.PORT || 3002;

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


//store url mappings
const urlCache = new cache.Cache();



//endpoint to shorten url
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.original_url;
  console.log('Received URL:', original_url); // Log just the URL
  let host;
  

  // Use URL constructor to parse the URL into an object
  try {
    const urlObject = new URL(original_url);
    console.log('URL Object:', urlObject); // Log the parsed URL object
    
    // Ensure the protocol is either http or https
    if (urlObject.protocol === 'http:' || urlObject.protocol === 'https:') {
      host = urlObject.hostname;
      console.log('Extracted Host:', host); // Log the extracted host
      
      // Generate short URL
      const short_url = generateShortUrl();
      console.log('Generated Short URL:', short_url); // Log the generated short URL


      // Store the mapping in cache (or memory)
      urlCache.put(short_url, original_url);

      res.json({ original_url, short_url });
    } else {
      res.json({ error: "invalid url" });
    }
    
  } catch(err) {
    // Catch invalid URL errors from URL constructor
    console.log('Error:', err.message); // Log error message
    res.json({ error: "invalid url" });
  }
});


  
  

 

//endpoint to redirect
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urlCache.get(short_url);

  if(original_url) {
    res.redirect(original_url)
  } else {
    res.json({error: "url not found"});
  }
})


function generateShortUrl () {
  const num = '1234567890'; // Digits to pick from
  const length = 7; // Desired length of the short URL
  let shortUrl = 0; // Initialize as a number

  for (i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * num.length);
    shortUrl = shortUrl * 10 + parseInt(num[randomNum]);
  }
  return shortUrl;
}


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
