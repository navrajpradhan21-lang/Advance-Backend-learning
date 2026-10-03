import express from "express";
import { configDotenv } from "dotenv";

configDotenv();

const port = process.env.PORT||5000
const app = express();

app.use(express.json())

app.get('/',async(req, res)=>{
    return res.status(200).json({message:'Hello from docker'})
})

app.listen(port,()=>{
    console.log(`Server Started at ${port}`)
})