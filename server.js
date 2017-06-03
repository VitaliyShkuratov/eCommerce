let express = require('express'),
    app = express(),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    engine = require('ejs-mate'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('express-flash'),
    passport = require('passport'),
    MongoStore = require('connect-mongo')(session),
    secret = require('./config/secret'),
    Category = require('./models/category'),
    mainRoutes = require('./routes/main'),
    userRoutes = require('./routes/user'),
    adminRoutes = require('./routes/admin'),
    apiRoutes = require('./api/api'),
    cartLength = require('./middlewares/middlewares');


mongoose.connect(secret.database, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to the database");
    }
});
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({ url: secret.database, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});
app.use(cartLength);
app.use(function(req, res, next) {
    Category.find({}, function(err, categories) {
        if (err) return next(err);
        res.locals.categories = categories;
        next();
    });
});
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.listen(secret.port, function(err) {
    if (err) throw err;
    console.log("Server is ranning...");
});