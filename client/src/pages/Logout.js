import React from 'react';
import Auth from '../utils/auth';

const Logout = () => {
  

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
