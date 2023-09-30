const mongoose = require("mongoose");
const dotenv = require("dotenv");
//uri="mongodb+srv://lovinsingh2205:Singh2205@cluster0.4yqkqve.mongodb.net/Cluster0?retryWrites=true&w=majority"

dotenv.config();
mongoose.set('strictQuery', true);
const connectDB = async() => {

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        //console.log('MongoDB Connected: ${conn.connection.host}');
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);

    } catch (error) {
        //console.log('Error: ${error.message}');
        console.log(`Error: ${error.message}`.red.bold);
        process.exit();
        
    }

};

module.exports = connectDB;