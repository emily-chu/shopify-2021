const { ObjectId } = require('mongodb');
const axios = require ('axios'); // just for initialization (loadBank)

/**
 * get the user document, but with the password removed
 * @param {MongoClient} db connection to shopify_backend
 * @param {String} user
 * @param {String} pass
 * @returns {Object}
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
 * Get list of images by ids, hopefully asynchronously
 * @param {MongoClient} db connection to shopify_backend 
 * @param {ObjectId[]} idList list of image _ids, generally from one user, generally to render 
 * @returns {Object[]}
 */
const getImagesByIds = async function(db, idList) {

  // Promise.all should prevent all ops happening in series (slow)
  // https://advancedweb.hu/how-to-use-async-functions-with-array-map-in-javascript/
  const out = await Promise.all(
    idList.map((id)=>getImageById(db, id))
  );
  return out || [];

  // const out = await Promise.all(
  //   idList.map(async (id) => {
  //     const image = await db.collection('images')
  //       .findOne({_id: ObjectId(id.toString())} );
  //     return image;
  //   })
  // );
  // return out || [];
}

/**
 * Get one image document by its _id
 * @param {MongoClient} db 
 * @param {ObjectId} id 
 * @returns {Object}
 */
const getImageById = async function(db, id) {
  try {
    return await db.collection('images').findOne(
      {_id: ObjectId(id.toString())} // TODO: Is there a better way of doing this lol
    );  
  } catch (err) {
    console.dir(err);
  }
}

/**
 * Checks for valid purchase, then delegates updates to buy() and sell() functions
 * @param {MongoClient} connection to shopify_backend
 * @param {String} username of seller (must be the actual owner of the image)
 * @param {String | ObjectId} _id of buyer (more secure than username, I think)
 * @param {String | ObjectId} _id of image
 */
// https://docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/change-a-document
const purchase = async function(db, buyerArg, sellerName, imageArg){
  const buyerId = (typeof(buyerArg) === 'string' ? ObjectId(buyerArg) : buyerArg); //TODO: remove these
  const imageId = (typeof(imageArg) === 'string' ? ObjectId(imageArg) : imageArg); 

  try {
    const buyer = await db.collection('users').findOne({_id: buyerId});
    const seller = await db.collection('users').findOne({username: sellerName});
    if (!buyer || !seller) return {message: 'Failed to find buyer: ' + buyerArg + ' or seller: ' + sellerName};
    // if (buyer._id == seller._id) return {message: 'You already own this image!'};

    const image = await db.collection('images').findOne({_id: imageId});
    if (!image) return {message: 'Invalid image.'};
    if (buyer.money < image.cost) return {message: 'Insufficient funds! Try selling some of your other images if you want this one.'};
    if (!checkOwnership(seller.images, image._id)) return {message: 'Seller does not own this image.'};

    sell(db, seller, image);
    buy(db, buyer, image);

  } catch (err) {
    console.dir(err);
    return {message: 'Database error in purchase()'};
  }
}

/**
 * Checks if the list of _ids contains the specified _id
 * @param {ObjectId[]} list of image _id objects
 * @param {ObjectId} image _id
 * @returns {Object | undefined} // unsure
 */
const checkOwnership = function(idList, id) {
  idList.find((i)=>{
    return i.toString() === id.toString(); 
  })
}

/**
 * Modifies the buyer user's .images and .money
 * @param {MongoClient} connection to shopify_backend
 * @param {Object} buyer document
 * @param {Object} image document
 */
const buy = async function(db, buyer, image){
  // let modified = 0;
  const buyerUpdate = {
    $inc: {money: -image.cost},
    $addToSet: {images: image._id}
  };
  await db.collection('users').updateOne(
    {_id: buyer._id}, 
    buyerUpdate, 
    (err, res) => {modified = res.result.nModified;}
  );
  // if (modified == 0) {}
}

/**
 * Modifies the seller user's .images and .money
 * @param {MongoClient} connection to shopify_backend
 * @param {Object} seller document
 * @param {Object} image document
 */
const sell = async function(db, seller, image){
  // let modified = 0;
  const sellerUpdate = {
    $inc: {money: image.cost},
    $pull: {images: image._id}
  };
  await db.collection('users').updateOne(
    {_id: seller._id}, 
    sellerUpdate, 
    (err, res) => {modified = res.result.nModified;}
  );
  // if (modified == 0) {}
}

/**
 * Initializes database with every photo picsum.photos has to offer; then adds these images to the Bank
 * @param {MongoClient} connection to shopify_backend
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
  getImageById: getImageById,
  getImagesByIds: getImagesByIds,
  purchase: purchase,
};
