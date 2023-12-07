const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

function getUserUrls(userId, database) {
  let userUrls = {};
  for (let urlId in database) {
    if (database[urlId].userID === userId) {
      userUrls[urlId] = database[urlId];
    }
  }
  return userUrls;
}

function isLoggedIn(user) {
  
  if (!user) {
    return false;
  }
  return true;
  };


module.exports = { getUserByEmail, generateRandomString, getUserUrls, isLoggedIn };