//define libraries
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//db config 
//comes from config/keys.js file
const db = require("./config/keys").mongoURI;

//connecting to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error -> ", err));

//creating app
const app = express();

//defining port
//if env variable PORT is set, than use it, otherwise use default 5000 port
//const port = process.env.PORT || 4000;
const port = 7000;

//load DB model
const Post = require('./models/post.model');

//to get the data from a POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//add and edit route
app.post("/api/add", (req, res) => {
  //id can be defined if we are editing some post 
  let id = req.body.id ? req.body.id : null;
  Post.findById(id)
    .then(post => {
      if (post) {
        //if such post already exists
        const postFields = {};
        //than put new data in appropriate fields
        if (req.body.topic) postFields.topic = req.body.topic;
        if (req.body.description) postFields.description = req.body.description;
        //and update post with new data
        Post.findOneAndUpdate({ _id: id }, { $set: postFields }, { new: true })
          .then(result => {
            return res.status(201).send({
              success: true,
              data: result,
              message: "Post updated successfully",
              type: "success"
            })
          })
          .catch(err => console.log("Post update err -> ", err));
      } else {
        //if post with such id doesn't exist, ie new post
        const newPost = new Post(req.body);
        //than create new and save        
        newPost.save()
          .then(result => {
            res.status(201).send({
              success: true,
              data: result,
              message: "Post created successfully",
              type: "success"
            });
          })
          .catch(err => console.log("Create new post error -> ", err))
      }
    })
    .catch(err => console.log("Post add error -> ", err))
})

//get all posts route
app.get("/api", (req, res) => {
  //empty object meant that we need to find all posts
  Post.find({})
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      console.log("Create new post error -> ", err)
    })
})

//delete post route
app.delete("/api/:post_id", (req, res) => {
  //we use post_id to find post and delete it
  Post.findByIdAndDelete(req.params.post_id)
    .then(result => {
      res.status(200).send({
        success: true,
        data: result,
        message: "Post deleted successfully",
        type: "success"
      });
    })
    .catch(err => console.log("Post delete err -> ", err));
});

//listen to all requests to this port
app.listen(port, function () {
  console.log('App listening on port 7000!');
});
