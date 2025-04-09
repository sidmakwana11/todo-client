import React from "react";
import { Link } from "react-router-dom";
import "E:/projects/Webforest-internship/todo-list-app/src/components/Navbar.css";

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup">Signup</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
