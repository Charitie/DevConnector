import express from 'express';
import {
  check,
  validationResult
} from 'express-validator';

import auth from '../../middleware/helpers/auth';
import Post from '../../models/post';
import Profile from '../../models/profile';
import User from '../../models/user';


const router = express.Router();

//@route        GET /posts
//@description  Create a post
//@access       Private

router.post('/posts', [auth,
  [
    check('text', 'Text is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }
  try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });

    const post = await newPost.save();

    res.json(post);

  } catch (err) {
    console.log(err.message);
    res.status(500).json('Server Error');
  }

});

//@route        GET /posts
//@description  Get all posts
//@access       Private
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({
      date: -1
    });

    res.json(posts);

  } catch (err) {
    console.log(err.message);
    res.status(500).json('Server Error');
  }
})

//@route        GET /posts/:id
//@description  Get a post by ID
//@access       Private
router.get('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        msg: 'Post not found'
      });
    }

    res.json(post);

  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        msg: 'Post not found'
      });
    }
    res.status(500).json('Server Error');
  }
})

//@route        DELETE posts/:id
//@description  Delete a post by ID
//@access       Private
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({
        msg: 'Post not found'
      })
    }

    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: 'User not authorized'
      })
    }

    await post.remove();

    res.json({
      msg: 'post removed'
    });

  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        msg: 'Post not found'
      });
    }
    res.status(500).json('Server Error');
  }
})

//@route        PUT posts/like/:id
//@description  Like a post by post ID
//@access       Private
router.put('/posts/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if post has already been liked by user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({
        msg: 'Post already liked'
      })
    }

    post.likes.unshift({
      user: req.user.id
    });

    await post.save();

    res.json(post.likes);

  } catch (err) {
    console.log(err.message);
    res.status(500).json('Server Error');
  }
})

//@route        PUT posts/unlike/:id
//@description  Unlike a post by post ID
//@access       Private
router.put('/posts/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if post has already been liked by user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({
        msg: 'Post has not yet been liked'
      })
    }

    //Get remove index
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.json(post.likes);

  } catch (err) {
    console.log(err.message);
    res.status(500).json('Server Error');
  }
})


//@route        POST /posts/cooment/:id
//@description  Comment a post
//@access       Private

router.post('/posts/comment/:id', [auth,
  [
    check('text', 'Text is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }
  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = ({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });

    post.comments.unshift(newComment);

    await post.save();

    res.json(post.comments);

  } catch (err) {
    console.log(err.message);
    res.status(500).json('Server Error');
  }

});


//@route        DELETE /posts/cooment/:id/:comment_id
//@description  Delete Comment 
//@access       Private
router.delete('/posts/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Pull out comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    //Make sure comment exists
    if (!comment) {
      return res.status(404).json({
        msg: 'Comment does not exist'
      });
    }

    //Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: 'User not authorized'
      })
    }

    //Get remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();
  
    res.json(post.comments);

  } catch (err) {
    console.log(err.message);
    res.status(500).json('Server Error');
  }
});


export default router;