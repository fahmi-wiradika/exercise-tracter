const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const userRoute = require('./route/user.route.js');

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/public', express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// user route
app.use("/api/users/", userRoute);

// Database Location
const MONGO_URI = process.env.DB;

// Database Connection (fire-and-forget: on Vercel the exported app is used
// directly as a request handler, so startup must not block on this promise)
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to database!"))
  .catch((err) => console.log("Connection failed!", err.message));

// Only bind a port when run directly (local dev via `node index.js` / `nodemon index.js`).
// On Vercel this file is imported as a module and the exported app is invoked per request instead.
if (require.main === module) {
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  });
}

module.exports = app;