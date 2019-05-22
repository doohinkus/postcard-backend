const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    posted: Date,
    author: String,
    text: String
});

const gallerySchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    owner: String,
    senderpostalcode: String,
    receiverpostalcode: String,
    sender: {
        lat: String,
        lng: String
    },
    receiver: {
        lat: String,
        lng: String
    },
    url: String,
    comments: [commentSchema]
});

module.exports = mongoose.model('Gallery', gallerySchema);