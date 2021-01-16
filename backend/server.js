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
      id: result._id,
      username: result.username,
      money: result.money,
      images: result.images
    }
  } catch (err) {
    console.dir(err);
  }
}

/**
 * @param {*} connection to shopify_backend
 * @param {String} _id of seller
 * @param {String} _id of buyer
 * @param {String} _id of image
 */
const purchase = async function(db, sellerId, buyerId, imageId){
  try {
    const result = await db.collection('users').findOne({username: user, password: pass});
  } catch (err) {
    console.dir(err);
  }
}

// public functions
module.exports = {
  login: login,
  purchase: purchase
};
