import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import sendEmail from "./lib/sendEmail.js";


const connection = new Redis("redis://localhost:6379",
    {maxRetriesPerRequest:null}
)
// worker ko queue ka naam dena hoga
const worker = new Worker("emailQueue",async (job)=>{
    console.log("job started")
    const email = job.data.email
    await sendEmail(email)
    console.log("job conmpleted")

},{connection})

// is worker.js file ko alag say run karna hoga


//node worker.js is the run command
