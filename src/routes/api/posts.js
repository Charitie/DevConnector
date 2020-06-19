import express from 'express';

const router = express.Router();

//@route        GET api/posts
//@description  Test route
//@access       Public

router.get('/posts',(req, res) => res.send('posts route'));

export default router;