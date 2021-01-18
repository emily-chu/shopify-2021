const express = require('express');
const app = express();
const server = require('./server');
const path = require('path');
const favicon = require('serve-favicon');

require('dotenv').config();
const uri = process.env.MONGO_URI;

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const viewOptions = { 
  // loading 1,093 images on one page is probably a bad idea
  marketplacePerUser: 5,
  perPage: 20,
  pages: function(arr) {
    return arr.length / 20 + 1;
  },
  getPage: function(arr, page){
    let end = page * 20;
    return arr.slice(page - 20, end);
  }
};

// Can't test using top-level async (yet): https://stackoverflow.com/questions/46515764/how-can-i-use-async-await-at-the-top-level
(async function main(){
  try {
    await client.connect();
    db = await client.db('shopify_backend');
    console.log('Connection to shopify_backend did not throw errors');
    //test here

    // let me = await server.login(db, 'emily', 'hunter2')
    // console.log(me);

    // server.loadBank(db); 

    // const maybe = await server.purchase(db, '5ff7636667380a5942ec2f9d', 'BANK', '60033b339b34b5bd841276e3'); //me, bank, first image
    // if (maybe && maybe.message) console.log(maybe.message);

    // let myImages = await server.getImagesByIds(db, me.images);
    // console.log(myImages);

    // let marketplace = await server.getMarketplace(db, viewOptions.marketplacePerUser);
    // console.log(marketplace);

    app.get('/', function(req, res){
      res.render('pages/empty', {
        user: global.user
      })
    });

    app.get('/login', function(req, res){
      delete global.user;
      res.render('pages/login', {
        hideLoginNav: {yep: 'yep'}
      })
    });

    app.post('/login', async function(req, res){
      global.user = await server.login(db, req.body.username, req.body.password);
      if (global.user) {
        res.redirect('/dashboard');
      } else {
        res.redirect('/login');
      }
    });

    app.get('/dashboard', async function(req, res){
      if (global.user) {
        let userImages = await server.getImagesByIds(db, global.user.images);
        res.render('pages/dashboard', {
          user: global.user,
          images: userImages
        });
      } else {
        res.redirect('/login');
      }
    });

    app.get('/marketplace', async function(req, res){
      let mkp = await server.getMarketplace(db, viewOptions.marketplacePerUser);
      res.render('pages/marketplace', {
        user: global.user,
        marketplace: mkp
      })
    });

    // app.get('/marketplace/:seller', function(req, res){
    //   res.render('pages/user', {
    //     user: global.user,
    //     sellerName: req.params.user
    //   })
    // });

    app.get('/image/:owner/:imageId', async function(req, res){
      let img = await server.getImageById(db, req.params.imageId);
      res.render('pages/admire', {
        user: global.user,
        ownerName: req.params.owner,
        image: img
      })
    });

    app.post('/purchase', async function(req, res) {
      if (!global.user) {
        res.redirect('/dashboard'); 
      } else {
        let response = await server.purchase(db, global.user._id, req.body.seller, req.body.image);
        let alert = (response && response.message) ? response.message : null;
        let mkp = await server.getMarketplace(db, viewOptions.marketplacePerUser);
        res.render('pages/marketplace', {
          user: global.user,
          marketplace: mkp,
          alert: alert
        })
      }
    })

    // Bad URL catcher
    app.get('*', function(req, res){
      res.render('pages/empty');
      res.status(404);
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