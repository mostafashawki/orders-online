const express     = require('express');
const helmet      = require('helmet');
const mongoose    = require('mongoose');
const bodyParser  = require('body-parser');
const path        = require('path');

const app = express();
//set security headers
app.use(helmet());

const index = require('./routes/index');
const customers = require('./routes/customers');
const orders = require('./routes/orders');
const items = require('./routes/items');


//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set static path
app.use(express.static(path.join(__dirname, 'public')));

// *** config file *** //
const db = require('./config/dbConfig').mongoURI[app.settings.env];

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected: ', app.settings.env))
  .catch(err => console.log(err));


// create our router
const router = express.Router();


// test route to make sure everything is working (accessed at GET http://localhost:8000/)
// router.get('/', function(req, res) {
// 	res.json({ message: 'welcome to API!' });
// });



const port = process.env.PORT || 8080;


// REGISTER OUR ROUTES -------------------------------
app.use('/', router);
// Use Routes
app.use('/', index);
app.use('/', customers);
app.use('/', orders);
app.use('/', items);





// error handling middleware
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  
  const errors = {};
  
  errors.message = error.message;
  res.render('errorsPage',{errors});
});

// START THE SERVERs
// =============================================================================
app.listen(port);
console.log('Server is running on port ' + port);

module.exports = app;