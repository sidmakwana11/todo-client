import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TodoList from "./components/TodoList";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ImageCropper from "./components/ImageCropper";
import "./App.css";

function App() {
  const isAuthenticated = !!sessionStorage.getItem("userId");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <TodoList /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/ImageCropper" element={isAuthenticated ? <ImageCropper /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
