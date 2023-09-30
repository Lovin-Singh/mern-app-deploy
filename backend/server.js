const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const cors = require("cors"); // Add the cors package
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const {notFound, errorHandler} = require("./middleware/errorMiddleware");
const { Socket } = require("socket.io");

const path = require("path");
const { default: mongoose } = require("mongoose");

app.use(cors(
 {
    origin: [""],
    methods: ["POST", "GET"],
    credentials: true
 }
));

mongoose.connect(`mongodb+srv://lovinsingh2205:Singh2205@cluster0.4yqkqve.mongodb.net/Cluster0?retryWrites=true&w=majority`);


dotenv.config();

connectDB();

const app = express();

app.use(express.json());  //to accept json data


//app.use(cors()); // Enable CORS


app.get('/' , ( req ,res ) => {
   res.send("API is Running Successfully");
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

//---------------------------------------DEPLOYMENT-----------------------------------------

const __dirname1 = path.resolve();
if(process.env.NODE_ENV === 'production') {

   app.use(express.static(path.join(__dirname1, '/frontend/build')));

   app.get('*' , (req,res) => {
      res.sendFile(path.resolve(__dirname1, "frontend", "build" , "index.html"));
   })

} else {
   app.get('/' , ( req ,res ) => {
   res.send("API is Running Successfully");
});
}




//---------------------------------------DEPLOYMENT-----------------------------------------
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(`${PORT}` , console.log (`Server Started on port ${PORT}`.yellow.bold));   

const io = require('socket.io')(server,{
   pingTimeout: 60000, //upto 60s if user rename inactive it will close the connection to save bandwidth
   cors:{
      origin:"http://localhost:3000",
   },
});


io.on("connection" , (socket) => {
console.log('Connected to socket.io');
socket.on('setup' , (userData) => {
   socket.join(userData._id);
   //console.log(userData._id);
   socket.emit("connected");
});


socket.on('join chat', (room) => {
   socket.join(room);
   console.log("User joined Room: " + room);
});

socket.on('typing', (room) => socket.in(room).emit("typing"));

socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));



//send message functionality

socket.on('new message', (newMessageReceived) => {
 var chat = newMessageReceived.chat;

 if(!chat.users) return console.log('chat.users not defined');

 //if i am sending a message then it should be received by other not me
 // so we r now creating logic for that

 chat.users.forEach((user) => {
   if(user._id == newMessageReceived.sender._id) return;
   
   socket.in(user._id).emit("message received" , newMessageReceived);
 }); 

});
 //closing socket bcz it will consume lot of bandwidth if left opened
  socket.off("setup", () => {
     console.log("USER DISCONNECTED");
     socket.leave(userData._id);
  });


});