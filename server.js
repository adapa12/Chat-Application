const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const user = require('./src/router/user');
const User = require("./src/models/User");
const Socket = require('./src/models/Socket')

const app = express();

let port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((data) => {
  console.log("DB Connected Successfully !");
}).catch((error) => {
  console.log(error.message);
});

app.use('/images/', express.static(__dirname + '/my-images'));

app.use('/api/v1/user', user);


// Enable CORS for all routes and methods

app.use(cors()); // Allows all origins

// const server = http.createServer(app);
// const io = new Server(server, {
//   path: "/pathToConnection",
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });


const server = app.listen(port, () => {
  console.log(`Server Listining On port : ${port}`)
});

const io = require('socket.io')(server, {
  path: "/pathToConnection",
    cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", async (socket) => {

  const socketId = socket.id;

  console.log(`Client connected with socket ID: ${socketId}`);
  const { user_uuid } = socket.handshake.query;

  console.log(`Client connected with user_uuid: ${user_uuid}`);

  if (user_uuid != "" && user_uuid != undefined) {
    const user = await User.findOne({ uuid: user_uuid });
    if (user.role === "user") {
      const userCheck = await Socket.findOne({ user_uuid: user_uuid });
      if (!userCheck) {
        await Socket.create({ user_uuid: user_uuid, socket_id: socketId });
        console.log("Created a new user");
      } else {
        await Socket.findOneAndUpdate({ user_uuid: user_uuid }, { socket_id: socketId });
        console.log("Updated Socket Id");
      }
    }
  }

  socket.on("chating-message", (data) => {
    io.emit("message", { name: data.name, message: data.message });
    console.log(`${data.name}: ${data.message}`);
  });

  socket.on('newOrder', async () => {

  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    await Socket.findOneAndDelete({ company_uuid: company_uuid });
    await Socket.findOneAndDelete({ store_uuid: store_uuid });
  });

});


// app.listen(port, () => {
//   console.log(`Server Listening On ${port}`);
// });