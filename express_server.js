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

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

app.get("/urls", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { username: username };  
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { username: username };  
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString(); // Updates the urlDatabase object with the new shortURL-longURL pair
  urlDatabase[id] = req.body.longURL;
  const username = req.cookies.username;
  const templateVars = { id: id, longURL: urlDatabase[id], username: username };
  res.render("urls_show", templateVars); 
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; // Deletes the shortURL-longURL pair from the urlDatabase object
  res.redirect("/urls"); 
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    const username = req.cookies.username;
    const templateVars = { id: id, longURL: urlDatabase[id], username: username };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Error 404: Page not found");
  }
  res.redirect(`/u/${id}`); 
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
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
