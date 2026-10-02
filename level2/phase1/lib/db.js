import mongoose from "mongoose"
import  { configDotenv } from "dotenv"
import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

configDotenv()

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("db connected")
    }catch(error){
        console.log(error)
    }
}

export default connectDB;
