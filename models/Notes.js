  const mongoose = require("mongoose");
  const findOrCreate = require('mongoose-findorcreate');
// Create Schema
const NotesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

     notes: [{
        title: {
            type: String,
            required: true
          },
          content: {
            type: String,
            required: true
          },
          date: {
            type: Date,
            default: Date.now
          }
     }]
 
});
NotesSchema.plugin(findOrCreate);
module.exports = Notes = mongoose.model("Notes", NotesSchema);