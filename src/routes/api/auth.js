import express from 'express';

const router = express.Router();

//@route        GET api/auth
//@description  Test route
//@access       Public

router.get('/auth',(req, res) => res.send('auth route'));

export default router;