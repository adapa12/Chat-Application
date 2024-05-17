const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// io.on("connection", (socket) => {
//   socket.on("chating-message", (data) => {
//     io.emit("message", { name: data.name, message: data.message });
//     console.log(`${data.name}: ${data.message}`);
//   });
// });

// app.use(express.static(path.resolve("./src")));

// app.get("/", (req, res) => {
//   return res.sendFile("/src/index.html");
// });

// server.listen(3000, () => console.log(`Server Started at PORT:3000`));



// Enable CORS for all routes and methods
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("chating-message", (data) => {
    io.emit("message", { name: data.name, message: data.message });
    console.log(`${data.name}: ${data.message}`);
  });
});

// If you still have static files to serve for other purposes, use the following line
// app.use(express.static(path.resolve("./src")));

// Start the server on port 5000
server.listen(5000, () => console.log(`Server Started at PORT: 5000`));
