//1. Dependencies
const express = require('express');
const expressSession = require('express-session');
const path = require('path');

//2.Instantiations
const app = express();
const port = 3000;

//3. Configurations
//set the templating engine to pug
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'))


//4.Middleware
 app.use(express.static(path.join(__dirname,'public')))

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(expressSession({
  secret:"secret",
  resave: false,  // we dont want to save this session
  saveUninitialized: false,
}))

//Routing
app.use('/', require('./routes/BTSRoutes'));
app.use('/',require('./routes/IndexRoutes'))




//this is always the last line in the code
app.listen(port,()=> console.log(`listening on port ${port}`));