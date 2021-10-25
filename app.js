const express = require('express');
const morgan = require('morgan');
const { join } = require('path');
const adminRoute = require('./routes/admin');
const userRoute = require('./routes/shop');
const authRoute = require('./routes/auth');
const { getPath } = require('./util/helpers');
const { get404 } = require('./controllers/error');


const MONGODB_URI =
  'mongodb+srv://Richard:azubike88@cluster0.4eqaw.mongodb.net/node-complete?retryWrites=true&w=majority';

const mongoose = require('mongoose');

const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const store = MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});



const UserModel = require('./data/schema/user');
//const expressHbs = require('express-handlebars')

const app = express();

app.use(morgan('dev'));

// use templating engine
//app.engine('hbs' ,expressHbs({layoutsDir :join(rootDir ,'views', 'layouts'), defautLayout : 'main' , extname : 'hbs'}))

app.set('view engine', 'ejs');
app.set('views', 'views');

// USE session middleware
app.use(
  session({
    name: 'user-session',
    secret: 'GFGEnter', // Secret key,
    //maxAge: 24 * 60 * 60 * 1000, // max age is set to 24 hrs,
    resave: false, // ie the session would not be saved on each request
    saveUninitialized: false,
    store,
  })
);


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  UserModel.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});



app.use(express.static(join(getPath, 'public')));

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(authRoute);

app.use('/admin', adminRoute);

app.use(userRoute);

app.use(get404);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the Database!!!');
    app.listen(3000, () => {
      console.log('App listening on port 3000!');
    });
  })
  .catch((err) => console.log(err));
