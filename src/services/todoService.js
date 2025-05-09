import axios from "axios";

const TODO_URL = process.env.REACT_APP_TODO_SERVICE;


export const getTasks = (userId) =>
  axios.get(`${TODO_URL}/todo/${userId}`);

export const createTask = (formData) => {
  return axios.post(`${TODO_URL}/todo/new`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteTask = (taskId) =>
  axios.delete(`${TODO_URL}/todo/delete/${taskId}`);

export const updateTask = (taskId, title) =>
  axios.put(`${TODO_URL}/todo/${taskId}`, { title });