const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    firstname: {
        type: String,
        required: [true, "Must include first name"]
    },
    lastname: {
        type: String,
        required: [true, "Must include last name"]
    },
    email: {
        type: String,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    streetaddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    postalcode: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ispaired: {
        type: Boolean,
        required: true
    },
    isparticipating: {
        type: Boolean
    },
    role: {
        type: ['user', 'admin'],
        required: true
    },
    partner: {
        partner_id: String
    }
   
});

module.exports = mongoose.model('User', userSchema);