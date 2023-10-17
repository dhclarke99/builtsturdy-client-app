import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../utils/auth';
import '../../utils/css/header.css'

const Header = () => {
  const isLoggedIn = Auth.loggedIn();
  const isAdmin = Auth.isLoggedInAndAdmin();
  const [showNav, setShowNav] = useState(false);

  const toggleNav = () => {
    setShowNav(!showNav); // Toggle the state
  };
  

  return (
    <header className='nav-header'>
      <h1>Built Sturdy Blueprint</h1>
      <nav>
      
      <ul className={`nav-ul ${showNav ? 'show' : ''}`} id='nav-ul'>
          
          
          {isAdmin && (
            <li>
              <Link to="/admin/admindashboard" onClick={toggleNav}>Admin Dashboard</Link>
            </li>
          )}
          
           {isLoggedIn && (
            <li>
              <Link to="/calendar" onClick={toggleNav}>Calendar</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/nutrition" onClick={toggleNav}>Nutrition</Link>
            </li>
          )}
          {!isLoggedIn && (
            <li>
              <Link to="/login" onClick={toggleNav}>Login</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/account" onClick={toggleNav}>Profile</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/logout" onClick={toggleNav}>Logout</Link>
            </li>
          )}
          
        </ul>
        <button className="nav-button" id="nav-button" onClick={toggleNav}>☰</button> 
      </nav>
    </header>
  );
};

export default Header;
