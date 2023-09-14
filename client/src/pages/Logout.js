import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGOUT_USER } from '../utils/mutations'; // replace with your actual logout mutation

import Auth from '../utils/auth';

const Logout = () => {
    const [logout] = useMutation(LOGOUT_USER);

    const handleLogout = async () => {
      try {
        const { data } = await logout();
        if (data.logout) {
          // Remove token from client storage
          localStorage.removeItem('token');
          window.location.href = "/login"
          // Redirect user to login page or do other clean-up
        }
      } catch (error) {
        console.error('Logout failed', error);
      }
    };

  return (
    <main>
      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </main>
  );
};

export default Logout;
