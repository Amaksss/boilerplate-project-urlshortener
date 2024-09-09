require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');
const cache = require('memory-cache');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://amakaorabuchi:g3bNkOcbY80UpEmB@cluster0.1u3ya.mongodb.net/urlShortener?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



// Define Schema and Model
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);


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








//endpoint to shorten url
app.post('/api/shorturl', async (req, res) => {
  const original_url = req.body.original_url;
  console.log('Received URL:', original_url);

  try {
    const urlObject = new URL(original_url);
    if (urlObject.protocol === 'http:' || urlObject.protocol === 'https:') {
      const urlCount = await Url.countDocuments(); // Count documents to generate sequential short URL
      const short_url = urlCount + 1;

      // Create a new URL document
      const url = new Url({ original_url, short_url });
      await url.save();

      res.json({ original_url, short_url });
    } else {
      res.json({ error: "invalid url" });
    }
  } catch (err) {
    console.log('Error:', err.message);
    res.json({ error: "invalid url" });
  }
});
  

  

      




  
  

 

//endpoint to redirect
app.get('/api/shorturl/:short_url', async (req, res) => {
  const short_url = req.params.short_url
  const url = await Url.findOne({ short_url })

  if(url) {
    res.redirect(url.original_url)
  } else {
    res.json({error: "url not found"});
  }
})


/*function generateShortUrl () {
  const num = '1234567890'; // Digits to pick from
  const length = 7; // Desired length of the short URL
  let shortUrl = 0; // Initialize as a number

  for (i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * num.length);
    shortUrl = shortUrl * 10 + parseInt(num[randomNum]);
  }
  return shortUrl;
}*/


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
