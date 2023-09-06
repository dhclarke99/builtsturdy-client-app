import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import AuthService from '../../utils/auth';
// import { QUERY_USER_by_id } from '../../utils/queries';
// import { useQuery } from '@apollo/client';

const Header = () => {
    return (
      <header>
        <h1>Built Sturdy Blueprint</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/exercise">Exercise</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          </ul>
        </nav>
      </header>
    );
  };
  
  export default Header;
