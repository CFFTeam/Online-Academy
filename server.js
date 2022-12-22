import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: "./config.env" });

mongoose.connect(process.env.DATABASE).then(() => {
    console.log("Connected to DB successfully");
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`App is running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection. Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1); // 0 is success, 1 is uncaught exception
    });
});
