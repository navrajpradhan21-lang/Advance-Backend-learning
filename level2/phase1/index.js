import express, { json } from "express"
import dotenv from "dotenv"
import connectDB from "./lib/db.js"
import userModel from "./model/user.model.js"
import Redis from "ioredis"
import rateLimiter from "./middleware/ratelimit.js"
import sendEmail from "./lib/sendEmail.js"
import emailQueue from "./queue.js"

dotenv.config()

const port = process.env.PORT || 5000

const app = express()
app.use(express.json())

export const redis = new Redis(process.env.REDIS_URL)

app.get("/",async(req,res)=>{
    return res.status(200).json({message:"Hello from docker 27"})
})

// creating a user
// without queue
app.post('/create',async(req,res)=>{
    const{name, email ,password} = req.body
    // Purana data redis say delete kar rahe hai 
    //(updating)
    await redis.del("user:all") // is key ka data delete kardo 

    const user = await userModel.create({
        name:name,
        email:email,
        password:password
    });
    await sendEmail() // 5 sec delay will be introduced 
    return res.json(user);
})

// with queue 
// npm i bullmq
app.post('/create-with-queue',async(req,res)=>{
    const{name, email ,password} = req.body
    // Purana data redis say delete kar rahe hai 
    //(updating)
    await redis.del("user:all") // is key ka data delete kardo 

    const user = await userModel.create({
        name:name,
        email:email,
        password:password
    });

    emailQueue.add("send-email",{email})
    // ab worker ko job mil gaya ab worker upna job karega 
    // jo isko karnay bola gaya hai 
    
     
    return res.json(user);
})

// getting the data
app.get('/get',rateLimiter,async(req,res)=>{
    const user = await userModel.find({})

    return res.json(user)
});

// Redis get 
app.get('/redis-get',async(req,res)=>{
    // redis check karega kiya is key k liya data hai 


    const cached = await redis.get("user:all") // naam aap kuch bhi rakh saktay ho
    // if cached may data mil jata hai toh return kar detay hai 
    if(cached){
        const user = JSON.parse(cached) // String say json may convert karnay k liya
        return res.json(user)
    }
    // agar cached may data nahi mila toh server jayega database may 

    const user = await userModel.find({})

    // storing the data in redis (for next time)
    await redis.set("user:all",JSON.stringify(user)) //string format may store hota hai
    return res.json(user)
})

// otp send redis 

app.post('/send-otp',async(req,res)=>{
    const {email} = req.body

    // generating otp
    const otp = Math.floor(100000+Math.random()*900000).toString()

    await redis.set(`otp:${email}`,otp,"EX",30) // expires in 30 sec

    return res.json({otp})

})

app.get('/verify-otp',async(req,res)=>{
    const {email,otp}= req.body;

    const cachedOtp = await redis.get(`otp:${email}`)

    if(!cachedOtp){
        return res.status(400).json({
            message:"otp not found or has been expired"
        });
    }

    if(cachedOtp != otp){
        return res.status(400).json({'message':"incorrect otp"})
    }

    // delete the otp
    await redis.del(`otp:${email}`)
    return res.json({message:"otp verified"})

})


app.listen(port,()=>{
    connectDB()
    console.log(`Server started at PORT ${port}`)
})