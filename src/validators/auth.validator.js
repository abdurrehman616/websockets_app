const { body } = require('express-validator');

exports.signupValidator = [
  body('name').notEmpty(),
  body('firstName').notEmpty(),
  body('email').isEmail(),
  body('country').notEmpty(),
  body('password').isLength({ min: 6 })
];
