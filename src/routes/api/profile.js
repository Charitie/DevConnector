import express from 'express';

const router = express.Router();

//@route        GET api/profile
//@description  Test route
//@access       Public

router.get('/profile',(req, res) => res.send('profile route'));

export default router;