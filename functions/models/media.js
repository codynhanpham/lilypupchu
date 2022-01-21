const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    source: String, // twitter or instagram
    user: String, // source social media username
    type: String, // image, video, gif
    subject: String, // pending --> temmie, davinky, both, else.    else --> 
    mediaID: String, // id leads to source post
    mediaKey: String, // id leads to image (can be use in image url)
    url: String, // image url
    content: String, // content of social media post
    created_at: String, // post uploaded date
    meta: {
        hash: String,
        distance: Number
    }
});

module.exports = mongoose.model('Media', mediaSchema);