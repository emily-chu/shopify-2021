/**
 * @param {*} connection to shopify_backend
 * @param {*} user.username
 * @param {*} user.password
 * @returns user document, but with the password removed
 */
const login = async function(db, user, pass){
  try {
    const result = await db.collection('users').findOne({username: user, password: pass});
    if (!result) {return null;}
    return {
      _id: result._id,
      username: result.username,
      money: result.money,
      images: result.images
    }
  } catch (err) {
    console.dir(err);
  }
};

/**
 * @param {*} connection to shopify_backend
 * @param {String} _id of seller (must be the actual owner of the image)
 * @param {String} _id of buyer
 * @param {String} _id of image
 */
// https://docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/change-a-document
const purchase = async function(db, sellerId, buyerId, imageId){
  try {
    if (buyerId == sellerId){
      console.log('You already own this image.');
      return;
    }

    const image = await db.collection('images').findOne({_id: ObjectId(imageId)});
    if (!image){
      console.log('Invalid image.');
      return;
    }

    const buyer = await db.collection('users').findOne({_id: ObjectId(buyerId)});
    if (buyer.money < image.cost){
      console.log('You don\'t have enough money for this image! Try selling some of your images if you want this one.');
      return;
    }

    const sellerUpdate = {
      // $inc: {money: image.cost},
      $pull: {images: ObjectId(imageId)}
    };
    const buyerUpdate = {
      // $inc: {money: -image.cost},
      $addToSet: {images: ObjectId(imageId)}
    };
    await db.collection('users').updateOne({_id: ObjectId(sellerId)}, sellerUpdate, function(err, res){});
    await db.collection('users').updateOne({_id: ObjectId(buyerId)}, buyerUpdate, function(err, res){});
  } catch (err) {
    console.dir(err);
  }
};

const axios = require ('axios');
const { ObjectId } = require('mongodb');
/**
 * Initializes database with every photo picsum.photos has to offer; then adds these images to the Bank
 * @param {*} connection to shopify_backend
 */
const loadBank = async function(db) {
  let documents = [];

  // Picsum API returns a maximum of 100 images per page, and only has 11 pages (0-10)
  for (let page = 0; page <= 10; page++){ 
    try {
      let response = await axios.get('https://picsum.photos/v2/list?page=' + page.toString() + '&limit=100')
      let pageDocuments = response.data;
      for (let img of pageDocuments){
        img.cost = Math.round(Math.random() * 100 * (page + 1)/2);
      }
      console.log(pageDocuments)
      documents.push(...pageDocuments);
    } catch (err) {
      console.dir(err);
      return {message: 'Axios couldn\'t retrieve the image list. Page: ' + page.toString()};
    }
  }
  
  try {
    await db.collection('images').insertMany(documents);
    db.collection('images').distinct('_id', {}, {}, function(err, result) {
      db.collection('users').updateOne(
        {username: 'BANK', password: undefined}, 
        {$set: {images: result}}
      );
    });
  } catch (err) {
    return {message: 'Loading images to DB failed.'};
  }
}

// public functions
module.exports = {
  loadBank: loadBank,
  login: login,
  purchase: purchase,
};
