const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

before(function(done){
    mongoose.connect('mongodb://mongo/postcardtest',  { useNewUrlParser: true, useCreateIndex: true });
    mongoose.connection.once('open', function(){
        console.log("Connection successful!!!!");
        done();
    })
    .on('error', err => console.log(err))

});
after(done => {
    mongoose.disconnect(()=> done());
});