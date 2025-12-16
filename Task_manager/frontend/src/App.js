import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks,setTasks] = useState([]);
  const [title,setTitle] = useState("");

  //Fetch tasks from the Backend
  const getTasks = async () => {
    const res = await axios.get("http://localhost:5000/tasks");
    setTasks(res.data);

  };

useEffect(() => {
  getTasks();

}, []);

//Add a new Tasks
const addTask = async () => {
  await axios.post("http://localhost:5000/tasks", { title });
  setTitle("");
  getTasks();
};

//Delete a Task
const deleteTask = async (id) => {
  await axios.delete(`http://localhost:5000/tasks/${id}`);
  getTasks();
};

return (
    <div style={{ padding: "20px"}}>
      <h1>Task Manager</h1>

      <input
      value = {title}
      onChange = {(e) => setTitle(e.target.value)}
      placeholder = "Enter Task"
      />
      <button onClick = {addTask}>Add Task</button>
      
      <ul>
        {tasks.map((task) => (
          <li key = {task._id}>
            {task.title}
            <button onClick = {() => deleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );

}



export default App;
