const express = require("express");
const mongoose = require("mongoose");
const Pusher = require("pusher");
const cors = require("cors");
require("dotenv").config();



const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));




var pusher = new Pusher({
  appId: '1092898',
  key: '3cf3d0345670cadee20c',
  secret: 'f8ac7b49dba99f36fc20',
  cluster: 'eu',
  usetls: true
});


// set up mongoose

mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDB connection established");
    const changeStream = mongoose.connection.collection("posts").watch();

    changeStream.on('change', (change) => {
      console.log("Change on collection POSTS");
      console.log(change);
      if(change.operationType === 'insert'){
        console.log("Post inserted");
        const postDetails = change.fullDocument;
        pusher.trigger('posts', 'inserted', {
          user: postDetails.iser,
          tweet: postDetails.tweet,
          imagename: postDetails.imagename,
          timestamp: postDetails.timestamp
        })
      }else{
        console.log("Error triggering Pusher");
      }
    })

  }
);




app.use("/users", require("./routes/userRouter"));
app.use("/posts", require("./routes/postRouter"));