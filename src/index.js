// require ('dotenv').config({path : './env'});
import dotenv from 'dotenv';

import connectDB from "./db/index.js"

dotenv.config({
    path : './env'
})

connectDB();
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