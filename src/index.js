import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"; // Import the app instance

dotenv.config({
    path: './env'
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR:", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGODB connection failed", err);
    });



// import express from "express";
// const app = express()

// ;(async()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",()=>{
//             console.log("ERRROR:",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
        
//     } catch (error) {
//         console.log("ERROR: ", error);
//         throw error

//     }
// })()