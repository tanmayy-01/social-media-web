import express from "express";
import { PORT } from "./config/serverConfig.js";
import connectDB from "./config/dbConfig.js";
import apiRouter from "./routers/apiRouter.js"

const app = express();
app.use(express.json())

app.use('/api', apiRouter) // If the URL starts with /api then the request is forwarded to the apiRouter.

app.listen(PORT,() => {
    console.log("Server start on http://localhost:", PORT)
    connectDB()
})