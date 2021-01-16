const express = require('express');
const app = express();
const server = require('./server');
const path = require('path');
require('dotenv').config();
const uri = process.env.MONGO_URI;

// import { MongoClient } from 'mongodb';
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Can't test using top-level async (yet): https://stackoverflow.com/questions/46515764/how-can-i-use-async-await-at-the-top-level
(async function main(){
  try {
    await client.connect();
    db = await client.db('shopify_backend');
    console.log('Connection to shopify_backend did not throw errors');
    //test here

    let test = await server.login(db, 'emily', 'hunter3')
    console.log(test);

  } catch (err) {
    console.dir(err);
  }
})();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend-from-heroku/public')));
app.set('views', path.join(__dirname, 'frontend-from-heroku'));
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/empty'))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
