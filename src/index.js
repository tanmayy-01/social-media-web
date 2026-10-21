import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from "./config/serverConfig.js";
import connectDB from "./config/dbConfig.js";
import apiRouter from "./routers/apiRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../public")));

app.use('/api', apiRouter); // If the URL starts with /api then the request is forwarded to the apiRouter.

app.listen(PORT, () => {
    console.log("Server start on http://localhost:", PORT);
    connectDB();
});