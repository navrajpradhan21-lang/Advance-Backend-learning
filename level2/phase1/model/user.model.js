import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
},{timestamps:true})


const userModel = await mongoose.model('User',userSchema)

export default userModel;
