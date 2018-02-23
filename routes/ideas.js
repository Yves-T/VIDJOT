const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

// load idea model
require('../models/Idea');
const Idea = mongoose.model('ideas');

router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort({ date: 'desc' })
    .then(ideas =>
      res.render('ideas/index', {
        ideas,
      }),
    );
});

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

router.get('/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  })
    .then(idea => {
      if (idea.user != req.user.id) {
        req.flash('error_msg', 'Not Authorized');
        res.redirect('/ideas');
      } else {
        res.render('ideas/edit', { idea });
      }
    })
    .catch(console.err);
});

// process the form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: 'please add a title' });
  }
  if (!req.body.details) {
    errors.push({ text: 'please add some details' });
  }
  if (errors.length > 0) {
    res.render('ideas/add', {
      errors,
      title: req.body.title,
      details: req.body.details,
    });
    return;
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
    };
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea saved');
        res.redirect('/ideas');
      })
      .catch(console.error);
  }
});

// edit form process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({ _id: req.params.id }).then(idea => {
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea updated');
        res.redirect('/ideas');
      })
      .catch(console.error);
  });
});

// delete idea

router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    })
    .catch(console.error);
});

module.exports = router;
