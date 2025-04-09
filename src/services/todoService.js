import axios from "axios";

const TODO_URL = process.env.REACT_APP_TODO_SERVICE;

export const getTasks = (userId) =>
  axios.get(`${TODO_URL}/todo/${userId}`);

export const addTask = (title, userId) =>
  axios.post(`${TODO_URL}/todo/new`, { title, userId });

export const deleteTask = (taskId) =>
  axios.delete(`${TODO_URL}/todo/delete/${taskId}`);
