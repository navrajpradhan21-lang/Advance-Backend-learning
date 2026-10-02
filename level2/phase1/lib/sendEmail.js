


// is function ki wajah say 5 sec ka delay ayega to stimulate 
const sendEmail = async(email)=>{
    await new Promise((resolve)=>{
        setTimeout(resolve,5000)
    })
    console.log("task completed")
}
export default sendEmail;
