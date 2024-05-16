// require ('dotenv').config({path : './env'});
import dotenv from 'dotenv';

import connectDB from "./db/index.js"

dotenv.config({
    path : './env'
})

connectDB()
.then(()=>{
    //If server throw a error at starting time
    app.on("error",(error)=>{
        console.log(`Error : ${error}`);
        throw error;
    })

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongo DB connection failed");
})

//Second way to connect DB
/*
import express from 'express';
const app = express();
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${thirdbackend}`);
        app.on("error",(error)=>{
            console.log("Error : ",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listining on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error("Error:",error);
        throw error
    }
})()
*/