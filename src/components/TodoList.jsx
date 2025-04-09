import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TodoItem from "./TodoItems";
import {
  getTasks,
  addTask as createTask,
  deleteTask as removeTask,
} from "../services/todoService";
import "./TodoList.css";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      fetchTasks();
    }
  }, [userId, navigate]);

  // ✅ Fetch tasks from service
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getTasks(userId);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new task
  const addTask = async () => {
    if (!newTask.trim()) {
      alert("Task cannot be empty!");
      return;
    }

    try {
      await createTask(newTask, userId);
      setNewTask("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id) => {
    try {
      await removeTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="container">
      <h1>{username}'s To-Do List</h1>
      <button onClick={handleLogout}>Logout</button>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask} disabled={!newTask.trim()}>
          Add Task
        </button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TodoItem key={task._id} task={task} deleteTask={deleteTask} />
            ))
          ) : (
            <li>No tasks available</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
