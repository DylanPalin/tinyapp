const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString } = require('./helpers');

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
  let userUrls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userId) {
      userUrls[id] = urlDatabase[id].longURL;
    }
  }
  const templateVars = { urls: userUrls, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.redirect("/login");
  }
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  if (users[req.session.user_id] !== undefined) {
    res.redirect("/urls");
  }
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id] !== undefined) {
    res.redirect("/urls");
  }
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_login", templateVars);
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
  console.log(users);
  res.redirect("/urls"); // Redirect to homepage
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString(); // Updates the urlDatabase object with the new shortURL-longURL pair
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(403).send("Error 403: You are not authorized to delete this URL");
  }
  delete urlDatabase[req.params.id]; // Deletes the shortURL-longURL pair from the urlDatabase object
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.longURL;
  if (!users[req.session.user_id]) {
    res.status(403).send("Error 403: You are not authorized to edit this URL");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("Error 404: Page not found");
  }

  urlDatabase[id].longURL = newUrl;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
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
    console.log(users);
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403: Invalid email or password");
  }
});

app.post('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("Error 404: Page not found");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(404).send("Error 404: URL not found");
  }

  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
