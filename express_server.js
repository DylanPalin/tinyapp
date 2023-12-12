const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, getUserUrls, isLoggedIn } = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "c8ia2g",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "c8ia2g",
  },
  "bf0h9G": {
    longURL: "http://www.soundcloud.com",
    userID: "qq4wzd",
  },
  "9dV54K": {
    longURL: "http://www.beatport.com",
    userID: "qq4wzd",
  },
};

const users = {
  'c8ia2g': {
    id: 'c8ia2g',
    password: '$2a$10$Pq6sKG1lJSVx9e2vQTobZeZKOH4Nrk3fTHjGwtN/HzEIJlCfGR/YK',
    email: 'yo@hi.com',
  },
  'qq4wzd': {
    id: 'qq4wzd',
    password: '$2a$10$LgkUPk0R4qPtVism3xzT1..ANYP1TcLK6xJwbiCNDKRUe0SYA3Xjq',
    email: 'dyl@gml.com',
  }
};

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!isLoggedIn(user)) {
    res.send(403, '<script>alert("Please login to view your URLs"); window.location.href="/login";</script>');;
    res.redirect("/login");
  }
  const userUrls = getUserUrls(userId, urlDatabase);
  const templateVars = { urls: userUrls, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!isLoggedIn(user)) {
    res.redirect("/login");
  } else {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (isLoggedIn(user)) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  if (!isLoggedIn(user)) {
    res.render("urls_login", templateVars);
  } else {
    return res.status(403).send("Error 403: You're already logged in");

  }
  res.redirect("/urls");
});

app.post("/urls/register", (req, res) => {
  const email = req.body.email; // Set email & pass to user's input from form
  const password = req.body.password;
  if (!email || !password) { // If email or password is empty, send 403 error
    return res.status(403).send("Error 403: email or password cannot be empty");
  }
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(403).send("Error 403: email already exists");
  }
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = { id: userId, email: email, password: hashedPassword };
  req.session.user_id = userId;
  res.redirect("/urls"); // Redirect to homepage
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!isLoggedIn(users[req.session.user_id])) {
    return res.status(403).send("Error 403: Please login to create a new URL");
  }
  const id = generateRandomString(); // Updates the urlDatabase object with the new shortURL-longURL pair
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  if (userId !== urlDatabase[id].userID) {
    return res.status(403).send("Error 403: You are not authorized to delete this URL");
  }

  delete urlDatabase[req.params.id]; // Deletes the shortURL-longURL pair from the urlDatabase object
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  if (userId !== urlDatabase[id].userID) {
    return res.status(403).send("Error 403: You are not authorized to edit this URL");
  }
  const newUrl = req.body.longURL;
  if (!urlDatabase[id]) {
    return res.status(404).send("Error 404: Page not found");
  }

  urlDatabase[id].longURL = newUrl;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  if (isLoggedIn(users[req.session.user_id])) {
    return res.status(403).send("Error 403: You're already logged in");
  }
  const email = req.body.email; // Get email from user's input
  const passwordInput = req.body.password; // Get password from user's input
  let userExists = false;
  let userId = null;

  for (let userKey in users) {
    const user = users[userKey];
    if (user.email === email && bcrypt.compareSync(passwordInput, user.password)) {
      userId = user.id;
      userExists = true;
      break;
    }
  }

  if (userExists) {
    req.session.user_id = userId;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403: Invalid email or password");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  req.session = null;
  res.redirect("/login");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    console.log("Error 404: URL not found");
    return res.status(404).send("Error 404: URL not found");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  console.log("id", id);
  console.log("urlDatabase", urlDatabase);
  if (!isLoggedIn(user)) {
    res.send(403, '<script>alert("Please login to view your URLs"); window.location.href="/login";</script>');;
    res.redirect("/login");
  }
  if (!urlDatabase[id]) {
    console.log("Error 404: URL not found");
    return res.status(404).send("Error 404: URL not found");
  }
  if ((userId !== urlDatabase[id].userID)) {
    return res.status(403).send("Error 403: You are not authorized to view this URL");
  }
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: user };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("Error 404: URL not found");
  }
  if ((!isLoggedIn(users[req.session.user_id]))) {
    return res.status(403).send("Error 403: You are not authorized to edit this URL");
  }
  if (userId !== urlDatabase[id].userID) {
    return res.status(403).send("Error 403: You are not authorized to edit this URL");
  }
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  if (!isLoggedIn(users[req.session.user_id])) {
    return res.status(403).send("Error 403: You are not authorized to view this page");
  }
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
