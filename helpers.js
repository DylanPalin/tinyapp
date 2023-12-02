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

module.exports = { getUserByEmail, generateRandomString };