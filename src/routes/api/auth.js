import express from 'express';
import { check, validationResult } from 'express-validator';
import moment from 'moment';

import auth from '../../middleware/helpers/auth';
import User from '../../models/user';
import EncryptData from '../../middleware/helpers/encryptPassword';
import { config } from '../../config';
import createToken from '../../middleware/helpers/jwtHelper';

const router = express.Router();

//@route        GET /auth
//@description  Test route
//@access       Public

router.get('/auth', auth, async (req, res) => {
  console.log('user details', res.user)
  try {
    console.log(req.user.id)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) {
    console.log(err.message);
    res.status(500).send('server error')
  }
});

//@route        GET /auth
//@description  authenticate user & get token
//@access       Public

router.post('/auth', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()

], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  
  const { email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });

    if(!user) {
      return res.status(400).json({ errors: [ { msg: 'Invalid credentials' }]})
    }

    const passwordMatch = await EncryptData.compareHash(
      password,
      user.password,
    );  
    if (!passwordMatch) {
      return res.status(400).json({ errors: [ { msg: 'Invalid credentials' }]});
    }

    const payload = {
      user: {
        id: user.id,
        expireToken: moment().add(1, 'days').format('YYYY-MM-DD')
      }
    }

    const token = createToken(payload, config.secretKey) 
      res.json({ 
        message: 'User logged in successfully',
        token
       })

  } catch(err) {
    console.log('users error', err.message);
    res.status(500).send('Server error');
  }

})



export default router;