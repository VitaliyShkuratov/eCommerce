let router = require('express').Router(),
    passport = require('passport'),
    async = require('async'),
    User = require('../models/user'),
    Cart = require('../models/cart'),
    passportConf = require('../config/passport');

router.get('/login', function(req, res) {
    if (req.user) return res.redirect('/');
    res.render('accounts/login', { message: req.flash('loginMessage') });

});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/profile', passportConf.isAuthenticated, function(req, res, next) {
    User
        .findOne({ _id: req.user._id })
        .populate('history.item')
        .exec(function(err, foundUser) {
            if (err) return next(err);
            res.render('accounts/profile', { user: foundUser });
        });
});

router.get('/signup', function(req, res) {
    res.render('accounts/signup', { errors: req.flash('errors') });
});

router.post('/signup', function(req, res, next) {

    async.waterfall([
        function(callback) {
            let newUser = new User();
            newUser.profile.name = req.body.name;
            newUser.password = req.body.password;
            newUser.email = req.body.email;
            newUser.profile.picture = newUser.gravatar();

            User.findOne({ email: req.body.email }, function(err, existingUser) {
                if (err) {
                    console.log(err);
                    return res.redirect('/signup');
                } else {
                    if (existingUser) {
                        req.flash('errors', 'Account with that email address already exists');
                        return res.redirect('/signup');
                    } else {
                        newUser.save(function(err, newUser) {
                            if (err) return next(err);
                            callback(null, newUser);
                        });
                    }
                }
            });
        },
        function(user) {
            let cart = new Cart();
            cart.owner = user._id;
            cart.save(function(err) {
                if (err) return next(err);
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    res.redirect('/profile');
                });
            });
        }
    ]);
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/edit-profile', function(req, res, next) {
    res.render('accounts/edit-profile', { message: req.flash('success') });
});
router.post('/edit-profile', function(req, res, next) {
    User.findOne({ _id: req.user._id }, function(err, user) {
        if (err) return next(err);
        if (req.body.name) user.profile.name = req.body.name;
        if (req.body.address) user.address = req.body.address;

        user.save(function(err) {
            if (err) return next(err);
            req.flash('success', 'Successfuly edited your profile');
            return res.redirect('/edit-profile');
        });
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));
module.exports = router;