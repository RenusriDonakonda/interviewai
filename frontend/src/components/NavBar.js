import React from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";

const NavBar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/interview">Interview</NavLink>
          <NavLink to="/resume">Resume</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <NavLink to="/auth">Login</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
