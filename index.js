const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const routes = require('./routes');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
routes(app);

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/docker-node-mongo',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use((req, res, next) => {
    return next(createError(404, 'Could not find your fucking file!'));
});

app.listen(port, ()=>{
    console.log(`App listening on ${port}`);
});
