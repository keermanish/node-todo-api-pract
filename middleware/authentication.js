const { User } = require('./../models/user.js');

const authentication = (req, res, next) => {
  const token = req.header('x-auth');
  User.findUserByToken(token)
    .then(user => {
      if(!user) {
        return Promise.reject();
      }

      req.user = user;
      req.token = token;
      next();
    })
    .catch(err => {
      res.status(401).send(err);
    })
};

module.exports = { authentication };
