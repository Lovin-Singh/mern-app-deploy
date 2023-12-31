const expressAsyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");

const sendMessage = expressAsyncHandler(async(req,res) =>{
    const { content, chatId} = req.body;
    
    if(!content || !chatId){
        console.log("Invalid data passes into request");
        return res.sendStatus(400);
    }
    /* else we create new message using var */

    var newMessage = {
        sender:req.user._id,
        content: content,
        chat: chatId,
    };
/*now in our try catch we can query our database */

  try {
      var message = await Message.create(newMessage);

       message = await message.populate("sender" , "name pic");
       message = await message.populate("chat");
       message = await User.populate(message ,{
           path:"chat.users",
           select: "name pic email",
       });

       await Chat.findByIdAndUpdate(req.body.chatId, {
           latestMessage: message,   /*ye object hota h jo{} k andar dete h*/
       });

       res.json(message);

  } catch (error) {
      res.status(400);
      throw new Error(error.message);
  }


});

const allMessages = expressAsyncHandler(async(req,res) =>{
  try {
      const messages = await Message.find({chat: req.params.chatId })
      .populate("sender" ,"name pic email")
      .populate("chat");
      res.json(messages);
  } catch (error) {
      res.status(400);
      throw new Error(error.message);
  }
});


module.exports = { sendMessage, allMessages };