var express = require('express');
var router = express.Router();
let Parser = require('rss-parser');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.body.rss_url);
  res.send('okokok')
});

router.post('/', async(req, res, next) => {
  console.log(req.body.rss_url);
  let feed = await parser.parseURL(req.body.rss_url);

  const fileUrl = feed.items[0].enclosure.url;

  const file = fs.readFileSync('./audio.wav');
  const audioBytes = file.toString('base64');
  console.log("len=" + audioBytes.length);
  res.json({data: 'responsdfaasdse'})
});

module.exports = router;
