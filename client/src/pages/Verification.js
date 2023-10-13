import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CHANGE_PASSWORD } from '../utils/mutations';

const Verification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [userId, setUserId] = useState(null); // New state variable to hold userId
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/verify-email/${token}`);
        const data = await response.json(); // Assuming server returns JSON with userId
        if (response.ok) {
          setStatus('success');
          setUserId(data.userId); // Store userId in state
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error("There was an error verifying the email:", error);
        setStatus('failed');
      }
    };
  
    verifyEmail();
  }, [token]);
  

  const handlePasswordChange = async () => {
    try {
      const { data } = await changePassword({
        variables: {
          userId: userId, // Use userId from state
          oldPassword: '', // Assuming oldPassword is not needed after email verification
          newPassword: newPassword,
        },
      });

      if (data.changePassword) {
        console.log('Password changed successfully');
      } else {
        console.log('Failed to change password');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div>
      {status === 'verifying' && <p>Verifying your email...</p>}

      {status === 'success' && (
        <div>
          <p>Email verified successfully!</p>
          <p>Enter your old password:</p>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <p>Please set your new password:</p>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange}>Change Password</button>
        </div>
      )}

      {status === 'failed' && (
        <div>
          <p>Verification failed. Please try again.</p>
          <Link to="/resend-verification">Resend Verification Email</Link>
        </div>
      )}
    </div>
  );
};

export default Verification;
