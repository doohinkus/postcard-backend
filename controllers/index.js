
const User = require('../models/user');
const Gallery = require('../models/gallery');
const path =require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, '../uploads/'))
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else{
        cb(new Error({message: "Bad filetype. jpeg or png 5mg or fewer"}), false);
    }
}
const key = require('../secret').toString();

const upload = multer({ 
    storage, 
    limits: 
        { 
            fileSize: 1024*1024*5
        },
    fileFilter
    });

exports.CheckAuth = (req, res, next) =>{
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if(typeof token !== 'undefined') {
        res.token = token.split(" ")[1];
        jwt.verify(token,key,function(err,verifiedToken){
            if(err) return res.json({message: "Error with token."});
            console.log("USER ID:", verifiedToken);
            res.verifiedToken = verifiedToken;
            next();
        });
    } else{
         return res.json({message: 'This Route is Forbidden'})
    }
}
exports.Index = (req, res, next) =>{
    return res.json({
        route: "Index"
    });
}
exports.Favicon = (req, res, next) =>{
    return res.sendStatus(204);
}
exports.UploadImage = upload.single('galleryImage');

exports.GalleryImages = (req, res, next) => {
    Gallery.find({})
        .sort({url: 'descending'})
        .exec()
        .then(images => {
            return res.json(images)
        })
        .catch(err => console.log("GALLERY ERROR::::: ", err));
}

exports.AddComment = (req, res, next) =>{
    const query = {
        _id: req.body._id
    }
    const data = {
        _id: mongoose.Types.ObjectId(),
        author: req.body.author,
        posted: new Date().toISOString(), 
        text: req.body.comment
    }
    Gallery.findOneAndUpdate(query, { $push : {comments: data }}, {upsert:true}, (err, result) => {
        if(err) return res.json({message: "error making comment", err});
        Gallery.find({})
            .sort({url: 'descending'})
            .exec()
            .then(images => {
                console.log(images);
                return res.json({message: "Success", images});
            })
            .catch(err => res.json({message: "Error adding comment"}));

    });
       

}

exports.AddImage = (req, res, next) =>{
    
    if(!req.file || !req.body.senderpostalcode || !req.body.receiverpostalcode){
        return res.json({message: "Error with form data.", token: res.verifiedToken})
    }  
    
    const image = new Gallery({
        _id: mongoose.Types.ObjectId(),
        url: req.file.filename,
        owner: res.verifiedToken.userid,
        senderpostalcode: req.body.senderpostalcode,
        receiverpostalcode: req.body.receiverpostalcode,
    });

    image.save()
        .then(result => {
            return res.json({
                success: `Gallery Photo  ${req.file.filename} added`,
                message: "Success",
                owner: res.verifiedToken.userid,
                image
            });
        })
        .catch(err => {
            console.error(err);
            return res.json({
                error: `An Error occured: ${err}`  
            })
        });

}
exports.Get = (req, res, next) =>{
    return res.json({
        route: `User by ID ${req.params.userId}`
    });
}

exports.Login = (req, res, next) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if(err) return res.json({error: err});
        if (!user) return res.status(404).json({error: `User not found`});
        bcrypt.compare(req.body.password, user.password, (err, result) =>{
            if(err) console.log(err);
            if (result){
                jwt.sign(
                    {email: user.email, userid: user._id}, 
                    key,
                    {expiresIn: '1h'}, 
                    (err, token) => {
                        if (err) return res.json({message: "error with token"});
                        console.log("USER:::> ", user)
                        if(user.ispaired){
                            User.findOne({_id: user.partner}, (err, partner) =>{
                                if (err)  return res.json({message: "Error fining partner"});
                                console.log("PARTNER::::> ", partner)
                                return res
                                .json({
                                    token, 
                                    message: "Success", 
                                    userinfo: user,
                                    partner: {
                                        partnername: partner.firstname,
                                        parnteremail: partner.email,
                                        partneraddress:{
                                            streetaddress: partner.streetaddress,
                                            city: partner.city,
                                            state: partner.state,
                                            country: partner.country,
                                            postalcode: partner.postalcode
                                        }
                                    }
        
                                });

                            })
                           
                        }else{
                            return res
                            .json({
                                token, 
                                message: "Success", 
                                userinfo: user});
                        }

                     
                    });
            } else{
                console.log("ESLE::::> ", user)
               return res.json({message: "Error loggin in"})
            }
          
        });
    });
   
        
}
exports.AddUser = 
    (req, res, next) => {
        User.find({ email : req.body.userinfo.email})
        .exec()
        .then(user => {
            if (user.length >= 1) return res.json({message: 'Duplicate information'});
            bcrypt.hash(req.body.userinfo.password, 10, (err, hash) => {
                if (err) return res.status(500).json({error: `Hashing error: ${err}`});
                
                const user = new User({
                    _id: mongoose.Types.ObjectId(),
                    firstname: req.body.userinfo.firstname,
                    lastname: req.body.userinfo.lastname,
                    email: req.body.userinfo.email,
                    streetname: req.body.userinfo.streetname,
                    streetaddress: req.body.userinfo.streetaddress,
                    city: req.body.userinfo.city,
                    state: req.body.userinfo.state,
                    country: req.body.userinfo.country,
                    postalcode: req.body.userinfo.postalcode,
                    password: hash,
                    ispaired: false,
                    isparticipating: false,
                    role: 'user',
                    partner: null
                })
                user.save()
                    .then(result => {
                        return res
                        .json({
                            route: 'POST',
                            message: 'Success',
                            userinfo: result
                        })
                    })
                    .catch(err => {
                        console.error(err);
                        return res.json({
                            error: `An Error occured: ${err}`  
                        })
                    });
            })
        })
        .catch(err => console.log(err));
  
    
}
exports.EditUser = (req, res, next) =>{
    const query = {
        _id: res.verifiedToken.userid
    }
    
    User.findOneAndUpdate(query, req.body.userinfo, {upsert:true}, function(err, result){
        if (err) return res.send(500, { error: err });
        User.findOne(query, (err, user) => {
            if(user.ispaired){
                jwt.sign(
                    {email: user.email, userid: user._id}, 
                    key,
                    {expiresIn: '1h'}, 
                    (err, token) => {
                        if (err) return res.json({message: "error with token"});
                        if(token){
                            User.findOne({_id: user.partner}, (err, partner) =>{
                                if (err)  return res.json({message: "Error fining partner"});
                                console.log("PARTNER::::> ", partner)
                                return res
                                .json({
                                    token, 
                                    message: "Success", 
                                    userinfo: user,
                                    partner: {
                                        partnername: partner.firstname,
                                        parnteremail: partner.email,
                                        partneraddress:{
                                            streetaddress: partner.streetaddress,
                                            city: partner.city,
                                            state: partner.state,
                                            country: partner.country,
                                            postalcode: partner.postalcode
                                        }
                                    }
        
                                });

                            })
                           
                        }
                     
                    });
               
            }
            else{
                return  res
                            .json({
                                token, 
                                message: "Success", 
                                userinfo: user})
            }
        });
    
    });
    
}
exports.DeleteUser = (req, res, next) =>{
    User.deleteOne({ _id: req.params.userId }, (err, success) => {
        if (err) return res.status(400).json({error: err});
        return res.status(200).json({message: 'user deleted'});
    });
  
}


exports.PairUsers = (req, res, next) => {
    User.find({})
        .exec()
        .then(user => {
            const id_list = user
                            .filter(user => user._id != null && user.isparticipating)
                            .map(user => user._id);
            console.log(id_list);
            const randomized = id_list.length > 2 ? randomizeArray(id_list) : id_list;
            randomized.forEach((user, index, arr) => {
                const partner = (index + 1) < randomized.length ? (index + 1) : 0;
                console.log(arr[index], " -> ", arr[partner]);
                User.findOneAndUpdate({_id: arr[index]}, {
                    partner: arr[partner],
                    ispaired: true,
                })
                .exec()
                .then(result => {
                    console.log("RESULT PAIRING::::> ", result);
                })
                .catch(err => console.log(err));
            })
           
        })
        .catch(err => {
            console.log(err)
            return res.json({message: "error matching pairs"});
        })
        return res.json({message: "pair user route"});
        
}

function randomizeArray(arr){
    const randomNum = Math.floor(Math.random()*arr.length);
    const randomItem = arr.splice(randomNum, 1);
    const mixedArr = [...randomItem, ...arr];
    if (arr.length == 2) return mixedArr;
    return [...randomizeArray(arr), ...randomItem];
}