require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require("path");
const cors = require('cors');



const app = express();
// Bodyparser middleware
app.use(express.json({extended:false}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose.connect(db,{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true,useFindAndModify: false})
.then(() => console.log("MongoDB successfully connected"))
.catch(err => console.log(err));

app.use(cors());

  

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);


// Routes
app.use("/api/users", require("./routes/Users"));
app.use("/api/notes", require("./routes/Notes"));

if(process.env.NODE_ENV === "production"){
    app.use(express.static("client/build"));
    app.get("*",(req,res) =>{
        res.sendFile(path.resolve(__dirname,"client","build","index.html"));
    })
}



const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));