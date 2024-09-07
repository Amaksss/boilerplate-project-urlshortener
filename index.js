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
  const originalUrl = req.body.originalUrl;
  let host;


  //use url constructor to parse the url into a url object that can be destructured
  try{
    const urlObject = new URL(originalUrl)
    //extract host from url
   host = urlObject.hostname;
  } catch(err) {
    res.json({ err: "Not a valid url"})
  }
  

  //verify url using dns lookup
  dns.lookup(host, (err, address) => {
    if(err) {
      res.json({ error: "Invalid url"})
    } else {
      const shortenedUrl = generateShortUrl();

      //store mappings in cache
      urlCache.put(shortenedUrl, originalUrl);
      res.json({ message: "valid url", address, shortenedUrl});
    }
  });
})


//endpoint to redirect
app.get('/api/shorturl/:shortenedurl', (req, res) => {
  const shortenedUrl = req.params.shortenedurl;
  const originalUrl = urlCache.get(shortenedUrl);

  if(originalUrl) {
    res.redirect(originalUrl)
  } else {
    res.json({error: "url not found"});
  }
})


function generateShortUrl () {
  const num = '1234567890';
  const length = 7;
  let shortUrl = '';

  for (i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * num.length);
    shortUrl += num[randomNum];
  }
  return shortUrl;
}


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
