import express from 'express'
import {
  check,
  validationResult
} from 'express-validator';
import request from 'request';

import auth from '../../middleware/helpers/auth'
import Profile from '../../models/profile'
import User from '../../models/user'
import { config } from '../../config';

const router = express.Router()

//@route        GET /profile/me
//@description  Get current user's profile
//@access       Private

router.get('/profile/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate(
      'user',
      ['name', 'avatar']
    )

    if (!profile) {
      return res.status(400).json({
        msg: 'There is no profile for this user'
      })
    }

    res.json(profile)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

//@route        Post /profile
//@description  Create or update user profile
//@access       Private

router.post(
  '/profile',
  [
    auth,
    [
      check('status', 'Status is required')
      .not()
      .isEmpty(),
      check('skills', 'Skills is required')
      .not()
      .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook
    } = req.body

    //build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    //build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram

    try {
      let profile = await Profile.findOne({
        user: req.user.id
      })

      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate({
          user: req.user.id
        }, {
          $set: profileFields
        }, {
          new: true
        });

        return res.json(profile);
      }
      //Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message)
      res.status(500).json('Server Error')
    }
  }
)

//@route        Get /profile
//@description  Get all profile
//@access       public
router.get('/profile', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
})


//@route        Get /profile/user/:user_id
//@description  Get profile by user ID
//@access       public
router.get('/profile/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({
      msg: 'profile not found'
    })
    res.json(profile)
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Profile not found'
      });
    }
    res.status(500).send('Server Error');
  }
})

//@route        Delete /profile
//@description  Delete profile, user & posts
//@access       Private
router.delete('/profile', auth, async (req, res) => {
  try {
    //@todo - remove users posts

    //Remove profile
    await Profile.findOneAndDelete({
      user: req.user.id
    });
    //Remove user
    await User.findOneAndDelete({
      _id: req.user.id
    });

    res.json({
      msg: 'User deleted'
    })
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
})

//@route        pUT /profile/experience
//@description  Add profile experience
//@access       Private
router.put('/profile/experience', [auth,
    [
      check('title', 'Tittle is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From is required').not().isEmpty(),

    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    }

    try {
      const profile = await Profile.findOne({
        user: req.user.id
      });

      profile.experience.unshift(newExperience);

      await profile.save();

      res.json(profile)

    } catch (err) {
      console.log(err.message)
      res.status(500).send('Server Error');
    }

  })

//@route        Delete /profile/experience/:exp_id
//@description  Delete experience from profile
//@access       Private
router.delete('/profile/experience/:exp_id', auth, async (req, res) => {
  try {

    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    // if(!foundProfile.experience._id) {
    //   return res.status(400).json({ msg: 'Experience not found' })
    // }

    await foundProfile.save();
    return res.status(200).json(foundProfile);

  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error');
  }
})



//@route        pUT /profile/education
//@description  Add profile education
//@access       Private
router.put('/profile/education', [auth,
  [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty(),
  ]
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEducation = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    profile.education.unshift(newEducation);

    await profile.save();

    res.json(profile)

  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error');
  }

})

//@route        Delete /profile/education/:edu_id
//@description  Delete education from profile
//@access       Private
router.delete('/profile/education/:edu_id', auth, async (req, res) => {
try {

  const foundProfile = await Profile.findOne({ user: req.user.id });

  if(!foundProfile) {
    return res.status(400).json({ msg: 'Education not found' })
  }

  foundProfile.education = foundProfile.education.filter(
    (edu) => edu._id.toString() !== req.params.edu_id
  );

  

  await foundProfile.save();
  return res.status(200).json(foundProfile);

} catch (err) {
  console.log(err.message)
  res.status(500).send('Server Error');
}
})

//@route        Get /profile/github/:username
//@description  Get user repos from Github
//@access       public
router.get('/profile/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.githubClientId}&
            client_secret=${config.githubSecret}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    }

    request(options, (error, response, body) => {
      if(error) console.error(error);

      if(response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found'})
      }

      res.json(JSON.parse(body));
    })
    
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error');
  }
})

export default router;