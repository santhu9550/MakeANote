const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes")
const { body,validationResult } = require('express-validator');
const passport = require("passport");


// @route GET api/notes
// @desc gives all notes,if no note-model for user it creates it. 
// @access Private
router.get("/",passport.authenticate('jwt', { session: false }),async (req,res) =>{
  Notes.findOrCreate({user: req.user.id}, function(err, note) {
    if(err){
      res.json({ errors:[{msg:err.message}]});
     }
    if(note){
        res.json(note);
      }
      
  });
});

// @route Delete api/notes/all
// @desc deletes all notes
// @access Private
router.delete("/all",passport.authenticate('jwt', { session: false }), async (req,res) =>{
  try {
      await Notes.findOneAndRemove({user:req.user.id});
      res.status(200).json({success: true,message:"Deleted All Notes.. "});
  } catch (error) {
    res.json({ errors:[{message:err.message}]}); 
  }
});

// @route Put api/notes
// @desc adds/modifies the note
// @access Private
router.put("/",[passport.authenticate('jwt', { session: false }),body("title",'"Title" Field is mandatory').not().isEmpty(),body("content",' Please Fill "Take a note" Field').not().isEmpty()], async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {title,content} = req.body;
  const noteData = {}
 noteData.title = title;
 noteData.content = content;
  try {
    Notes.findOrCreate({user: req.user.id}, function(error, foundNote) {
            if(foundNote){
          foundNote.notes.unshift(noteData);
          foundNote.save();
          res.status(200).json({success: true,notes:foundNote.notes});
        }});
  } catch (error) {
    res.json({ errors:[{msg:err.message}]});
  }
});

// @route Delete api/notes/noteid
// @desc deletes specific note
// @access Private

router.delete("/:noteid",passport.authenticate('jwt', { session: false }), async (req,res) =>{
  try {
    Notes.findOne({user:req.user.id},(err,foundNote) =>{
     const removeIndex = foundNote.notes.map(item => item.id).indexOf(req.params.noteid);
     foundNote.notes.splice(removeIndex,1); 
     foundNote.save();
     res.status(200).json({success: true,notes:foundNote.notes});
     
  });
      
  } catch (error) {
    res.json({ errors:[{msg:err.message}]}); 
  }
});

module.exports = router;
