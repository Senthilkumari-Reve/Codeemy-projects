const express = require("express");
const mongoose = require("mongoose");
const cors =require("cors");

const app = express();
const corsOptions = {
    origin: 'http://localhost:3000', // Only allow requests from your React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json()); //middleware to parse json data

//connect to mongodb
mongoose.connect("mongodb://127.0.0.1:27017/tasksdb")
.then(() => console.log("MongoDB  Connected"))
.catch(err => console.log(err));

//define task schema
const taskSchema = new mongoose.Schema({
    title : String
});

//Model
const Task = mongoose.model("Task", taskSchema);

//routes
app.get("/tasks", async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post("/tasks", async (req, res) => {
    const task = new Task({ title: req.body.title });
    await task.save();
    res.json({ message: "Task Added Successfully"});
});

app.delete("/tasks/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task Deleted Successfully"});
});

app.listen(5000, () => console.log("server started on port 5000"));