import React from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../utils/auth';
import '../../utils/header.css'

const Header = () => {
  const isLoggedIn = Auth.loggedIn();
  const isAdmin = Auth.isLoggedInAndAdmin();

  return (
    <header className='nav-header'>
      <h1>Built Sturdy Blueprint</h1>
      <nav>
        <ul className='nav-ul'>
          <li>
            <Link to="/">Home</Link>
          </li>
          {isLoggedIn && (
            <li>
              <Link to="/account">Account</Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/admin/admindashboard">Admin Dashboard</Link>
            </li>
          )}
          
           {isLoggedIn && (
            <li>
              <Link to="/calendar">Calendar</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/nutrition">Nutrition</Link>
            </li>
          )}
          <li>
            <Link to="/exercise">Exercise</Link>
          </li>
          {!isLoggedIn && (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <Link to="/logout">Logout</Link>
            </li>
          )}
          {!isLoggedIn && (
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
