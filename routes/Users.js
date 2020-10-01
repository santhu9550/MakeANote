const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body,validationResult } = require('express-validator');
const passport = require("passport");



// @route POST api/Users/register
// @desc Register user
// @access Public
router.post("/register",[body("name","name is mandatory").not().isEmpty(),body("email","email is mandatory").isEmail(),body('password',"password must conatain 5 letters" ).isLength({ min: 5 })],(req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {name,email,password} = req.body;
    User.findOne({ email:email }).then(user => {
      if (user) {return res.status(400).json({ errors:[{msg:"Email Already Exists.Please Login.."}]});} 
      else {
        const newUser = new User({name: name,email: email,password: password});
          // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => { 
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json({msg:"Voila, Successfully Registered.Please Login To Continue.."}))
            .catch(err => console.log(err));
                     });
              });
            }
    })
});



// @route POST api/Users/login
// @desc Login user and return JWT token
// @access Public

router.post('/login',[body("email","email is mandatory").isEmail(),body('password',"password must conatain 5 letters" ).isLength({ min: 5 })],(req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password} = req.body;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {return res.status(404).json({ errors:[{msg:"Email Not Registered.Please Register.."}]});}
    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {id: user.id,name: user.name};
        // Sign token
        jwt.sign(payload,process.env.SECRET,{expiresIn: '30m' },(err, token) => {
          if(err){res.json({ errors:[{msg:err.message}]})} 
          res.json({success: true,token: "Bearer " + token});
        });
          } else {return res.status(400).json({ errors:[{msg:"Invalid Credentials.."}]});}
        });
    });
  });

// @route POST api/Users/fblogin
// @desc Login with Fb user and return JWT token
// @access Public
  router.post('/fblogin',(req,res) =>{
    
       const {name,email,fid} = req.body;
  
    // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (user) {const payload = {id: user.id,name: user.name};
      jwt.sign(payload,process.env.SECRET,{expiresIn: 31556926 },(err, token) => {
        if(err){res.json({ errors:[{msg:err.message}]})} 
        res.json({success: true,token: "Bearer " + token});    
            })}
            else{
              const newUser = new User({name: name,email: email,fid: fid});
              newUser.save()
            .then((user) => {const payload = {id: user.id,name: user.name};
            jwt.sign(payload,process.env.SECRET,{expiresIn: '30m' },(err, token) => {
              if(err){res.json({ errors:[{msg:err.message}]})} 
              res.json({success: true,token: "Bearer " + token});    
                  })

            }).catch(err => res.json({ errors:[{msg:err.message}]}));
            }
      
          });
      });



  router.get("/me",passport.authenticate('jwt', { session: false }),(req,res) =>{
   res.json(req.user);
  });

module.exports = router;