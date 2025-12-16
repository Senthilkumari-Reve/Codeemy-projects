const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running successfully");

});

//your API routes here
app.use("/api/tasks", require("./routes/taskRoutes"));

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});