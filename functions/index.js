const fs = require('fs');
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require('cors');
const PORT = 8080;
// const { mongooseConnect } = require('./config.json');
const mongooseConnect = process.env.mongooseConnect;
const mongoose = require('mongoose');
const Media = require('./models/media.js');
const { promisify } = require('util');
const wait = require('util').promisify(setTimeout);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


let media = [];
let both = [];
let temmie = [];
let davinky = [];

async function getImages(){
    // Connect to MongoDB
    await mongoose.connect(mongooseConnect,{
        useUnifiedTopology : true,
        useNewUrlParser : true,
    }).then(console.log('Connected to MongoDB!'));

    const data = await Media.find({ type: 'photo' }).catch(err => console.log(err));
    media = data;

    both = media.filter(item => item.subject === 'both');
    temmie = media.filter(item => item.subject === 'temmie');
    davinky = media.filter(item => item.subject === 'davinky');

    console.log('Data collection fetched!');
    console.log(media.length + ' total images');
    console.log(temmie.length + ' images of Temmie');
    console.log(davinky.length + ' images of DaVinky');
    console.log(both.length + ' images of both Temmie and Vinky');
    mongoose.connection.close();
};

getImages();


function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function randomList(range, outputCount) {
    let arr = [];
    for (let i = 0; i <= range; i++) {
      arr.push(i);
    };
  
    let result = [];
  
    for (let i = 1; i <= outputCount; i++) {
      const random = Math.floor(Math.random() * (range - i));
      result.push(arr[random]);
      arr[random] = arr[range - i];
    }
  
    return result;
};

function randomImage(subject,count) {
    let imageList = [];
    if (count === null || count === undefined) {count = 1};

    if (subject === 'both') {
        let randomIndexes = randomList(both.length-1,Math.floor(count));
        for (let i=0; i<randomIndexes.length; i++) {
            const data = {
                source: both[randomIndexes[i]].source,
                url: both[randomIndexes[i]].url,
                tweet: `https://twitter.com/user/status/${both[randomIndexes[i]].mediaID}`,
                user: both[randomIndexes[i]].user,
                content: both[randomIndexes[i]].content,
                created_at: both[randomIndexes[i]].created_at
            };
            imageList.push(data);
        };
    }
    else if (subject === 'temmie') {
        let randomIndexes = randomList(temmie.length-1,Math.floor(count));
        for (let i=0; i<randomIndexes.length; i++) {
            const data = {
                source: temmie[randomIndexes[i]].source,
                url: temmie[randomIndexes[i]].url,
                tweet: `https://twitter.com/user/status/${temmie[randomIndexes[i]].mediaID}`,
                user: temmie[randomIndexes[i]].user,
                content: temmie[randomIndexes[i]].content,
                created_at: temmie[randomIndexes[i]].created_at
            };
            imageList.push(data);
        };
    }
    else if (subject === 'davinky') {
        let randomIndexes = randomList(davinky.length-1,Math.floor(count));
        for (let i=0; i<randomIndexes.length; i++) {
            const data = {
                source: davinky[randomIndexes[i]].source,
                url: davinky[randomIndexes[i]].url,
                tweet: `https://twitter.com/user/status/${davinky[randomIndexes[i]].mediaID}`,
                user: davinky[randomIndexes[i]].user,
                content: davinky[randomIndexes[i]].content,
                created_at: davinky[randomIndexes[i]].created_at
            };
            imageList.push(data);
        };
    }
    else if (subject === null || subject === undefined) {
        let randomIndexes = randomList(media.length-1,Math.floor(count));
        for (let i=0; i<randomIndexes.length; i++) {
            const data = {
                source: media[randomIndexes[i]].source,
                url: media[randomIndexes[i]].url,
                tweet: `https://twitter.com/user/status/${media[randomIndexes[i]].mediaID}`,
                user: media[randomIndexes[i]].user,
                content: media[randomIndexes[i]].content,
                created_at: media[randomIndexes[i]].created_at
            };
            imageList.push(data);
        };
    }
    return imageList;
};

// Send webpage:
app.get('/', (req,res) => {
    fs.readFileSync('./webpages/index.html', 'utf-8', (err, html) => {
        if (err) {
            res.status(500).send('Server is out of order.');
        };
        res.send(html)
    })
})


// A test ping
app.get('/testmsg*', (req, res) => {
    res.status(200).send({
        message : 'This is your test message response. Honestly, what do you expect? At least the API server is working correctly...',
        idkman : {
            time : Date(),
            url : 'https://instagr.am/lilypupchu',
            message : `idk man... hope you could fix the problem soon...`
        }
    });
    console.log('Test message is received. A 200 response should have been sent out.')
});


const listOfSubject = ['both', 'temmie', 'davinky'];
app.get('/poms/:count?/:subject?', async function(req, res) {
    const count = req.query.count || req.params.count;
    const subject = req.query.subject || req.params.subject;

    if (!count && !subject) {
        const i = randomNumber(0,media.length-1);
        res.status(200).send({
            message : 'Here is a random pom pic for you :>',
            data : {
                source: media[i].source,
                url: media[i].url,
                tweet: `https://twitter.com/user/status/${media[i].mediaID}`,
                user: media[i].user,
                content: media[i].content,
                created_at: media[i].created_at
            }
        });
    }

    // Cap max at 20
    else if (!isNaN(Number.parseInt(count)) && Math.floor(count) > 25) {
        res.status(400).send({
            error: `Maximum image count per request is 25. Capping it at 25 helps lower the cost to run the server... At the same time, with the current collection size of ${both.length} for images with both Temmie and Davinky, or ${davinky.length} for images of Davinky, higher count per request is kinda messed up (vouch for more pics of Vinky pls :">). Idk, I might raise this number higher in the future, or just let the count matches the maximum available images whenever it's higher.`
        });
    }

    // only one param provided, so check if it's actually count, or is it subject
    else if (count && !subject) { 
        if (!isNaN(Number.parseInt(count)) && Math.floor(count) > 0) { // actually is count...
            const imageList = randomImage(null, Math.floor(count));
            res.status(200).send({
                message : `Here are ${imageList.length} random images for yaaaa ~ <3`,
                data : imageList
            });
        }
        else if (listOfSubject.includes(count.toLowerCase())) { // nah, it's a requested subject. i know. it looks weird...
            const imageList = randomImage(count.toLowerCase(), 1);
            res.status(200).send({
                message : `Here is a cute image of ${count.toLowerCase()} for uwu ~`,
                data : imageList
            });
        }
        else if (!isNaN(Number.parseInt(count)) && Math.floor(count) <= 0) { // really?
            res.status(418).send({
                'D:': 'https://static-cdn.jtvnw.net/emoticons/v2/25/static/light/3.0'
            });
        }
        else { // Syntax error
            res.status(400).send({
                error: 'Syntax error. The api endpoint is /poms/:count?/:subject? ; for example: /poms/2/temmie ; count must be <= 25, and subject can be "temmie" OR "davinky" OR "both". Leaving count empty will set it to 1 by default, while leaving subject empty will set it to a random one of the three.'
            });
        };
    }

    // both params included, but they might messed up the syntax somehow...
    else if (count && subject) {
        if (!isNaN(Number.parseInt(count)) && Math.floor(count) > 0 && listOfSubject.includes(subject.toLowerCase())) { // Correct syntax
            const imageList = randomImage(subject, Math.floor(count));
            res.status(200).send({
                message : `Here are ${imageList.length} images of ${subject} for yaaa ~`,
                data : imageList
            });
        }
        else if (isNaN(Number.parseInt(count)) || !listOfSubject.includes(subject.toLowerCase())) {
            res.status(400).send({
                error: 'Syntax error. The api endpoint is /poms/:count?/:subject? ; for example: /poms/2/temmie ; count must be <= 25, and subject can be "temmie" OR "davinky" OR "both". Leaving count empty will set it to 1 by default, while leaving subject empty will set it to a random one of the three.'
            });
        }
        else if (!isNaN(Number.parseInt(count)) && Math.floor(count) <= 0) { // dude... c'mon...
            res.status(418).send({
                'D:': 'https://static-cdn.jtvnw.net/emoticons/v2/25/static/light/3.0'
            });
        }
        else { // Syntax error
            res.status(400).send({
                error: 'Syntax error. The api endpoint is /poms/:count?/:subject? ; for example: /poms/2/temmie ; count must be <= 25, and subject can be "temmie" OR "davinky" OR "both". Leaving count empty will set it to 1 by default, while leaving subject empty will set it to a random one of the three.'
            });
        };
    }

    // this is just for the query request...
    else if (!count && subject) { 
        if (listOfSubject.includes(subject.toLowerCase())) { // nah, it's a requested subject. i know. it looks weird...
            const imageList = randomImage(subject.toLowerCase(), 1);
            res.status(200).send({
                message : `Here is a cute image of ${subject.toLowerCase()} for uwu ~`,
                data : imageList
            });
        }
        else { // Syntax error
            res.status(400).send({
                error: 'Syntax error. The api endpoint is /poms/:count?/:subject? ; for example: /poms/2/temmie ; count must be <= 25, and subject can be "temmie" OR "davinky" OR "both". Leaving count empty will set it to 1 by default, while leaving subject empty will set it to a random one of the three.'
            });
        };
    }

    else { // Syntax error
        res.status(400).send({
            error: 'Syntax error. The api endpoint is /poms/:count?/:subject? ; for example: /poms/2/temmie ; count must be <= 25, and subject can be "temmie" OR "davinky" OR "both". Leaving count empty will set it to 1 by default, while leaving subject empty will set it to a random one of the three.'
        });
    };
});



app.listen(
    PORT,
    () => console.log(`The app is now live on http://<hostname>:${PORT}`)
);
