const express = require('express');
const morgan = require('morgan');
const { join } = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
//require('dotenv').config({ path: './.env' });
const helmet = require('helmet');
const compression = require('compression');

const https = require('https');

const fs = require('fs');

const adminRoute = require('./routes/admin');
const userRoute = require('./routes/shop');
const authRoute = require('./routes/auth');
const { getPath } = require('./util/helpers');
const { get404, get500 } = require('./controllers/error');
const getCurrentUser = require('./middlewares/current_user');

const mongoose = require('mongoose');

const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const store = MongoDBStore({
  uri: process.envMONGODB_URI,
  collection: 'sessions',
});

//const expressHbs = require('express-handlebars')

const app = express();

const accessLogStream = fs.createWriteStream(join(__dirname, 'access.log'), {
  flags: 'a',
});

const key = fs.readFileSync(join(__dirname, 'server.key'));

const certificate = fs.readFileSync(join(__dirname, 'server.cert'));

app.use(morgan('combined', { stream: accessLogStream }));

const csrfProtection = csrf();

// use templating engine
//app.engine('hbs' ,expressHbs({layoutsDir :join(rootDir ,'views', 'layouts'), defautLayout : 'main' , extname : 'hbs'}))

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(compression());

app.use(express.static(join(getPath, 'public')));

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Use session middleware
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

// place this after the session middleware
app.use(csrfProtection);

app.use(flash());

app.use(getCurrentUser);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(authRoute);

app.use('/admin', adminRoute);

app.use(userRoute);

app.get('/server_error', get500);

// this should always appear last
app.use(get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  return res.redirect('/server_error');
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the Database!!!');
    // https.createServer({ key, cert: certificate }, app)
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
