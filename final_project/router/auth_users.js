const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(user => user.username === username);

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

// Secret key for JWT
const secretKey = 'your_secret_key';


//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
 const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: "Failed to authenticate token" });

    req.user = user;
    next();
  });
};

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const book = books[isbn];
  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/modified successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const book = books[isbn];
  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  }

  return res.status(404).json({ message: "Review not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
