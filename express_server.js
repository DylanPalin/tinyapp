const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

app.get("/urls", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.redirect("/login");
  }
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.redirect("/login");
  }
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  if (users[req.cookies.user_id] !== undefined) {
    res.redirect("/urls");
  }
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  res.render("urls_login", templateVars);
});


app.post("/urls/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email; // Set email & pass to user's input from form
  const password = req.body.password;
  const user = users[id];
  const templateVars = { id: id, password: password, email: email };
  res.cookie('user_id', id); // Set cookie to user's id
  if (email === "" || password === "") { // If email or password is empty, send 400 error
    res.status(403).send("Error 403: email or password cannot be empty");
  }
  for (const user in users) { // If email already exists, send 400 error
    if (users[user].email === email) {
      res.status(403).send("Error 403: email already exists");
    }
  }
  users[id] = templateVars; // Add new user to users object
  console.log(users);
  res.redirect("/urls"); // Redirect to homepage
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString(); // Updates the urlDatabase object with the new shortURL-longURL pair
  urlDatabase[id] = req.body.longURL;
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { id: id, longURL: urlDatabase[id], user: user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.status(403).send("Error 403: You are not authorized to delete this URL");
  }
  delete urlDatabase[req.params.id]; // Deletes the shortURL-longURL pair from the urlDatabase object
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.status(403).send("Error 403: You are not authorized to edit this URL");
  }
  const id = req.params.id;
  if (urlDatabase[id]) {
    const userId = req.cookies.user_id;
    const user = users[userId];
    const templateVars = { id: id, longURL: urlDatabase[id], user: user };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Error 404: Page not found");
  }
  res.redirect(`/u/${id}`);
});

app.post('/login', (req, res) => {
  const email = req.body.email; // Get email from user's input
  const password = req.body.password; // Get password from user's input

  let userExists = false;
  let userId = null;

  for (let userKey in users) {
    const user = users[userKey];
    if (user.email === email && user.password === password) {
      userId = user.id;
      userExists = true;
      break;
    }
  }

  if (userExists) {
    res.cookie('user_id', userId);
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403: Invalid email or password");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // Gets the longURL from the urlDatabase object
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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
