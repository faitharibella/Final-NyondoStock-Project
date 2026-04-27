// //1. Dependencies
// const express = require('express');
// const expressSession = require('express-session');
// const path = require('path');
// const mongoose = require('mongoose');

// require('dotenv').config();
// const connectDb = require('./config/db');
// //2.Instantiations
// const app = express();
// const port = 3000;

// //3. Configurations
// connectDb();
// //set the templating engine to pug
// app.set('view engine','pug');
// app.set('views', path.join(__dirname, 'views'));


// //4.Middleware
//  app.use(express.static(path.join(__dirname,'public')))

// app.use(express.urlencoded({extended:true}));
// app.use(express.json());

// app.use(expressSession({
//   secret:"secret",
//   resave: false,  // we dont want to save this session
//   saveUninitialized: false,
// }))

// //Routing
// app.use('/', require('./routes/BTSRoutes'));
// app.use('/',require('./routes/authRoutes'));





// //this is always the last line in the code
// app.listen(port,()=> console.log(`listening on port ${port}`));

// SECTION 1: Dependencies
const express = require('express');
const expressSession = require('express-session');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config();
const connectDb = require('./config/db')

// SECTION 2: Instantiations
const app = express();
const port = 3000;

// SECTION 3: Configurations
connectDb();
// set the templating engine to pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));


// SECTION 4: Middleware
app.use(express.static(path.join(__dirname,'public')));
// To parse URL encoded data
app.use(express.urlencoded({ extended: false }));
app.use(expressSession({
  secret:"secret",
  resave: false,
  saveUninitialized: false
}))

// SECTION 5: Routes
app.use('/', require('./routes/BTSRoutes'));
app.use('/',require('./routes/authRoutes'));






// Second last chunk of code in this file ever
// Handling non-existent routes
app.use((req, res) => {
  res.status(404).send('Oops! Route not found.');
});

// SECTION 6: Bootstrapping Server
// Last line of code in this file ever because it's responsible for running the server.
app.listen(port, () => console.log(`listening on port ${port}`));