import express from 'express';
import {
  check,
  validationResult
} from 'express-validator';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import moment from 'moment';


import User from '../../models/user';
import createToken from '../../middleware/helpers/jwtHelper';
import EncryptData from '../../middleware/helpers/encryptPassword';

const router = express.Router();

//@route        GET api/users
//@description  Test route
//@access       Public

router.post('/users', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a a password with 6 or more characters').isLength({ min: 6 })

], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  
  const { name, email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });

    if(user) {
      return res.status(400).json({ errors: [ { msg: 'User already exists' }]})
    }
    
    const avatar = gravatar.url(email, {
      // s-size, r-rating, d-default 
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    user = new User({ 
      name,
      email,
      avatar,
      password
    })

    user.password = await EncryptData.generateHash(password);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        expireToken: moment().add(1, 'days').format('YYYY-MM-DD')
      }
    }

    const token = createToken({payload}, config.secretKey) 
      res.json({ token })

  } catch(err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }


  res.send('user registered')
})

export default router;