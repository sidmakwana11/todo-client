
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TodoItem from "./TodoItems";
import {
    getTasks,
    createTask,
    deleteTask as removeTask,
} from "../services/todoService";
import "./TodoList.css";
import { FaCropAlt } from "react-icons/fa";

function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); // For initial selection preview
    const [tempCroppedImageForNewTask, setTempCroppedImageForNewTask] = useState(null); // For previewing cropped new image
    const navigate = useNavigate();
    const location = useLocation();

    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getTasks(userId);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error?.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            navigate("/login");
        } else {
            fetchTasks();
        }
    }, [userId, navigate, fetchTasks]);

    useEffect(() => {
        if (location.state?.tempCroppedImage && location.state?.taskId) {
            const taskIdToUpdate = location.state.taskId;
            const newCroppedImage = location.state.tempCroppedImage;
            console.log("New Cropped Image:", newCroppedImage);
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskIdToUpdate ? { ...task, tempCroppedImage: newCroppedImage } : task
                )
            );
            navigate(location.pathname, { replace: true, state: {} });
            console.log(`TodoList: Temporary cropped image received for task ID: ${taskIdToUpdate}`);
        } else if (location.state?.tempCroppedImage && !location.state?.taskId) {
            // Received cropped image for a new task
            setTempCroppedImageForNewTask(location.state.tempCroppedImage);
            console.log("TodoList: Temporary cropped image received for a new task.");
            navigate(location.pathname, { replace: true, state: {} });
        } else if (location.state?.message) {
            console.log("TodoList:", location.state.message);
            navigate(location.pathname, { replace: true, state: {} });
        } else if (location.state && Object.keys(location.state).length > 0) {
            console.log("TodoList: Received some state:", location.state);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname, setTasks]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
        setTempCroppedImageForNewTask(null); // Clear any previous cropped image for a new task
    };

    const navigateToCropper = (taskId = null) => {
        if (selectedImage || taskId) {
            let imageUrl = null;
            if (selectedImage) {
                imageUrl = URL.createObjectURL(selectedImage);
            } else if (taskId) {
                const taskToEdit = tasks.find(task => task._id === taskId);
                imageUrl = taskToEdit?.image ? `${process.env.REACT_APP_TODO_SERVICE}/image/${taskToEdit.image}` : null;
                if (!imageUrl) {
                    alert("No image to edit for this task.");
                    return;
                }
            }
            navigate("/ImageCropper", { state: { imageUrl: imageUrl, taskId: taskId } });
            setSelectedImage(null); // Reset selected image after navigating
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) fileInput.value = "";
        } else {
            alert("Please select an image first.");
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) {
            alert("Task cannot be empty!");
            return;
        }
    
        const formData = new FormData();
        formData.append("title", newTask);
        formData.append("userId", userId);
    
        let imageFile = null;
    
        // Check if a cropped image exists
        if (tempCroppedImageForNewTask) {
            const response = await fetch(tempCroppedImageForNewTask);
            const blob = await response.blob();
            imageFile = new File([blob], "cropped_image.png", { type: "image/png" });
        } 
        // Check if a selected image exists
        else if (selectedImage) {
            imageFile = selectedImage;
        }
    
        // If an image exists, append it to the form data
        if (imageFile) {
            formData.append("image", imageFile);
        }
    
        try {
            const response = await fetch(`${process.env.REACT_APP_TODO_SERVICE}/todo/new`, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                setNewTask("");  // Reset the task input
                setSelectedImage(null);  // Reset the image selection
                setTempCroppedImageForNewTask(null);  // Reset cropped image state
                fetchTasks();  // Refresh the task list
            } else {
                const errorData = await response.json();
                console.error("Error adding task:", errorData);
                alert(`Failed to add task: ${errorData?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error adding task:", error?.message);
            alert("Failed to add task. Please try again.");
        }
    };
    

    const deleteTask = async (id) => {
        try {
            await removeTask(id);
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("userId");
        navigate("/login");
    };

    useEffect(() => {
      console.log("tempCroppedImageForNewTask:", tempCroppedImageForNewTask)
    }, [tempCroppedImageForNewTask])
 
    return (
        <div className="container">
            <div className="header-container">
                <h1 className="header-todo">{username ? `${username}'s To-Do List` : "To-Do List"}</h1>
                {userId ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <button onClick={() => navigate("/login")}>Login</button>
                )}
            </div>

            <div className="input-container">
                <button onClick={() => document.getElementById("imageUpload").click()}>📷</button>
                <input
                    type="text"
                    placeholder="Enter a task..."
                    maxLength="70"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') addTask();
                    }}
                />
                <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                />
                <button onClick={addTask} disabled={!newTask.trim()}>
                    Add Task
                </button>
            </div>

            {selectedImage && !tempCroppedImageForNewTask && (
                <div className="preview-container">
                    <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="image-preview"
                    />
                    <button className="crop-button" onClick={() => navigateToCropper()}>
                        <FaCropAlt /> 
                    </button>
                    <button
                        className="remove-image"
                        onClick={() => {
                            setSelectedImage(null);
                            setTempCroppedImageForNewTask(null);
                            const fileInput = document.getElementById("imageUpload");
                            if (fileInput) fileInput.value = "";
                        }}
                    >
                        ❌
                    </button>
                </div>
            )}

            {tempCroppedImageForNewTask && (
                <div className="preview-container">
                    <img
                        src={tempCroppedImageForNewTask}
                        alt="Cropped Preview"
                        className="image-preview"
                    />
                    <button className="crop-button" onClick={() => navigateToCropper()}>
                        <FaCropAlt /> 
                    </button>
                    <button
                        className="remove-image"
                        onClick={() => setTempCroppedImageForNewTask(null)}
                    >
                        ❌
                    </button>
                </div>
            )}

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <ul>
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <TodoItem
                                key={task._id}
                                task={task}
                                deleteTask={deleteTask}
                                fetchTasks={fetchTasks}
                                navigateToCropper={navigateToCropper}
                            />
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

