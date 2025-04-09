import React from "react";
import "./TodoItems.css";

function TodoItem({ task, deleteTask }) {
  return (
    <li className="task-item">
      {task.title}
      <button onClick={() => deleteTask(task._id)}>Delete</button>
    </li>
  );
}

export default TodoItem;
