import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGOUT_USER } from '../utils/mutations'; // replace with your actual logout mutation

import Auth from '../utils/auth';

const Logout = () => {
    const [logout] = useMutation(LOGOUT_USER);

    const handleLogout = async () => {
      Auth.logout();
      
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
