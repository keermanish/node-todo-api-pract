const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 1
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    minlength: 1,
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: 'Enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'name', 'email']);
}

userSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, 'abc123').toString();

  user.tokens.push({token, access});

  return user.save()
    .then(() => {
      return token;
    });
}

userSchema.methods.removeToken = function(token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
}

userSchema.statics.findUserByToken = function(token) {
  const user = this;
  var decode = null;

  try {
    decode = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject(e);
  }

  return user.findOne({
    '_id': decode._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

userSchema.statics.findUserByCredentials = function(email, password) {
  const user = this;

  return user.findOne({ email })
    .then(res => {
      if(!res) {
        return Promise.reject();
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, res.password, (err, isMatched) => {
          if(isMatched) {
            return resolve(res);
          }

          reject();
        });
      });
    });
}

userSchema.pre('save', function(next) {
  const user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User
};
