const express = require('express');
const app = express();
const server = require('./server');
const path = require('path');
const favicon = require('serve-favicon');

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

    let me = await server.login(db, 'emily', 'hunter2')
    // console.log(me);

    // server.loadBank(db); 

    // const maybe = await server.purchase(db, '5ff7636667380a5942ec2f9d', 'BANK', '60033b339b34b5bd841276e3'); //me, bank, first image
    // if (maybe && maybe.message) console.log(maybe.message);

    let myImages = await server.getImagesByIds(db, me.images);
    // console.log(myImages);

    app.get('/', function(req, res){
      res.render('pages/empty')
    });

    app.get('/login', function(req, res){
      res.render('pages/login')
    });

    app.post('/dashboard', async function(req, res){
      let user = await server.login(db, req.body.username, req.body.password);
      if (user) {
        let userImages = await server.getImagesByIds(db, user.images);
        res.render('pages/dashboard', {user: user, images: userImages});
      } else {
        
        let user = await server.login(db, 'emily', 'hunter2');
        let userImages = await server.getImagesByIds(db, user.images);
        res.render('pages/dashboard', {user: user, images: userImages});
        
        // res.redirect('/login');
      }
    });

    app.get('/marketplace', function(req, res){
      res.render('pages/empty')
    });

    app.get('/marketplace/:user', function(req, res){
      res.render('pages/empty')
    });

    app.get('/image/:id', function(req, res){
      res.render('pages/empty')
    });

  } catch (err) {
    console.dir(err);
  }
})();


app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend-from-heroku'));
app.use(express.static(path.join(__dirname, 'frontend-from-heroku/public')));
app.use(favicon(path.join(__dirname, 'frontend-from-heroku', 'public', 'favicon.ico')));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));