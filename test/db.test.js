const mongoose = require('mongoose');
const expect = require('chai').expect;
const Gallery = require('../models/gallery');
const User = require('../models/user');

describe('Gallery collection', () => {
    beforeEach(done => {
        const image = new Gallery({
            _id: mongoose.Types.ObjectId(),
            owner: "Rafael",
            senderpostalcode: 97055,
            receiverpostalcode: 95125,
            url: '/static/avatar.gif',
            comments: [{
                posted: new Date(),
                author: "Monica",
                text: "Beautiful postcard"
            }]
        });
        image.save()
            .then(() => done());
        
    });
    afterEach(done => {
        mongoose.connection.collections['galleries'].deleteOne();
        done();
    })
  
    it('saves a record to the gallery', done => {
        Gallery.findOne({
            owner: "Rafael"
        })
        .then(result => {
            expect(result.owner).to.eql("Rafael");
            done();
        })
    });

    it('saves a record to the gallery comments', done => {
        Gallery.findOne({
            owner: "Rafael"
        })
        .then(result => {
            result.comments.push({
                posted: new Date(),
                author: "Jeff",
                text: "This is a decent card!!!!"
            });
            expect(result.comments).to.have.lengthOf(2);
        })
        done();
    });
    
});


describe('Users collection', () => {
    beforeEach(done => {
        const user = new User({
            _id: mongoose.Types.ObjectId(),
            firstname: "Rafael",
            lastname: "Perez",
            contact: {
                email: "d0ohinkus@gmail.com",
                address: {
                    streetaddress: "1234 Fake Street",
                    city: "Fake City",
                    state: "CA",
                    country: "USA",
                    postalcode: 97055
                }
            },
            password: "fake",
            ispaired: 0,
            isparticipating: 0,
            role: 'user',
            partner: 'id goes here'
        });
        user.save((err, result) => {
                if (err) console.log(err);
                done();
        });
    });
    afterEach(done => {
        mongoose.connection.collections['users'].deleteOne();
        done();
    })
    it('does CRUD on the user to the collection', done =>{
        it('finds a record in the collection', () => {
            User.findOne({
                firstname: "Rafael"
            }, (err, result) => {
                if(err) console.log("FIND ONE ERRO::::> ", err);
                expect(result.firstname).to.equal("Rafael");
            });
        });
        done();
    });
    it('edits a particular record in the collection', (done)=> {
        User.findOne({
            firstname: "Rafael"
        }, (err, result) => {
            if(err) console.log("FIND ONE ERRO::::> ", err);
            result.firstname = "Darren"
            expect(result.firstname).to.equal("Darren");
        });
        done();
    });
    it('deletes a particular record in the collection', (done)=> {
        const query = {
            firstname: "Rafael"
        }
        User.findOneAndDelete(query, (err, result) => {
            if(err) console.log("FIND ONE ERRO::::> ", err);
             User.findOne(query, (err, result) => {
                 if(err) console.log(err);
                 expect(result).to.equal(null)
             })
        });
        done();
    });

});