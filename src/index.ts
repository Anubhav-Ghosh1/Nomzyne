import dotenv from "dotenv";
import connectDB from "./database/index.js";
import { app } from "../src/app.js";
dotenv.config();

connectDB()
    .then(() => {
        app.on("error",(error)=>
        {
            console.log("Error")
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Listening at port ${process.env.PORT}`);
        });
    })
    .catch((e) => {
        console.log("Connection error");
    });