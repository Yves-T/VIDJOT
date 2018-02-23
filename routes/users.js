const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
require('../models/User');
const User = mongoose.model('users');

// user login route
router.get('/login', (req, res) => {
  res.render('users/login');
});

// user register route
router.get('/register', (req, res) => {
  res.render('users/register');
});

// login form POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// register form POST
router.post('/register', (req, res) => {
  let errors = [];
  const { password, password2, name, email } = req.body;
  if (password != password2) {
    errors.push({ text: 'Passwords do not match' });
  }
  if (password.lenght < 4) {
    errors.push({ text: 'Passwords must be at least 4 characters' });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email }).then(user => {
      if (user) {
        req.flash('error_msg', 'Email already registered');
        res.redirect('/users/register');
        return;
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registerd and can log in',
                );
                res.redirect('/users/login');
              })
              .catch(err => console.error);
          });
        });
      }
    });
  }
});

router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
