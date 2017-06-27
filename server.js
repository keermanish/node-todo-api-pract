const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const { mongoose } = require('./db/db.js');
const { User } = require('./models/user.js');
const { authentication } = require('./middleware/authentication.js');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('Root Route');
});

/**
 * create new user
 */
app.post('/user', (req, res) => {
  var user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  user.save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(err => {
      res.send(err);
    })
});

/**
 * get user info
 */
app.get('/user/:uid', (req, res) => {
  User.findById(req.params.uid)
    .then(doc => {
      res.send(doc);
    })
    .catch(err => {
      res.status(404).send(err);
    });
});

/**
 * check me - authentic route
 */
app.get('/user/me/token', authentication, (req, res) => {
  res.send(req.user);
});

/**
 * delete user
 */
app.delete('/user/token', authentication, (req, res) => {
  req.user.removeToken(req.header('x-auth'))
    .then(() => {
      res.send();
    })
    .catch(err => {
      res.status(401).send(err);
    });
});

/**
 * user login
 */
app.post('/user/login', (req, res) => {
  var user = null;
  User.findUserByCredentials(req.body.email, req.body.password)
    .then(data => {
      if(!data) {
        return Promise.reject();
      }

      user = data;
      return user.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(err => {
      res.status(401).send(err);
    });
});

app.listen(port, () => {
  console.log(`App listen on ${port}`);
});
