import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try{
        if(!MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    }
    catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;
