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
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { user: user };  
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { user: user };  
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email; // Set email & pass to user's input from form
  const password = req.body.password;
  const user = users[id];
  const templateVars = { id: id, password: password, email: email };
  res.cookie('user_id', id); // Set cookie to user's id
  if (email === "" || password === "") { // If email or password is empty, send 400 error
    res.status(400).send("Error 400: email or password cannot be empty");
  }
  for (const user in users) { // If email already exists, send 400 error
    if (users[user].email === email) {
      res.status(400).send("Error 400: email already exists");
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
  delete urlDatabase[req.params.id]; // Deletes the shortURL-longURL pair from the urlDatabase object
  res.redirect("/urls"); 
});

app.post("/urls/:id/edit", (req, res) => {
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
  const userId = req.cookies.user_id;
  if (userId && users[userId]) {
    res.redirect("/urls");
  } else {
    res.status(403).send("User not found");
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
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
