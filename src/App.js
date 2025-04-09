import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TodoList from "./components/TodoList";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if user is logged in

  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={isAuthenticated ? <TodoList /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
