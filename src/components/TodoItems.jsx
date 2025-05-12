
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TodoItems.css";
import { useNavigate } from "react-router-dom";

const TODO_URL = process.env.REACT_APP_TODO_SERVICE;

function TodoItem({ task, deleteTask, fetchTasks, navigateToCropper }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const navigate = useNavigate();

    const handleEdit = async () => {
        try {
            await axios.put(`${TODO_URL}/todo/${task._id}`, {
                title: editedTitle,
            });
            setIsEditing(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const handleNavigateToCropper = (taskId, currentImageUrl) => {
        navigateToCropper(taskId, null, currentImageUrl);
    };

    useEffect(() => {
        console.log("TodoItem received task:", task);
    }, [task]);
    

    useEffect(() => {
        console.log("TodoItem : task.tempCroppedImage :", task.tempCroppedImage);
    },[task.tempCroppedImage]);

    return (
        <li className="task-item">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        maxLength="70"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <button onClick={handleEdit}>Save Title</button>
                    <button onClick={() => handleNavigateToCropper(task._id, task.image ? `${TODO_URL}/image/${task.image}` : null)}>Edit Image</button>
                    <button onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                </>
            ) : (
                <div className="task-content">
                    <input type="checkbox" id="checkbox" />
                    <span className="task-title" maxlength="70">{task.title}</span>
                    {task.tempCroppedImage && (
                        <img
                            src={task.tempCroppedImage}
                            alt="Edited Task Preview"
                            className="task-image"
                        />
                    )}
                    {!task.tempCroppedImage && task.image && (
                        <img
                            src={`${TODO_URL}/image/${task.image}`}
                            alt="Task"
                            className="task-image"
                        />
                    )}
                    <div className="task-buttons">
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                        <button onClick={() => deleteTask(task._id)}>Delete</button>
                    </div>
                </div>
            )}
        </li>
    );
}

export default TodoItem;
