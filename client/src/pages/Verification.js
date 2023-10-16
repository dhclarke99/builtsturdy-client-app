import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CHANGE_PASSWORD } from '../utils/mutations';

const Verification = () => {
  console.log("Verification component mounted");  
  const { token } = useParams()
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [userId, setUserId] = useState(null); // New state variable to hold userId
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // New state variable for confirmation password

  useEffect(() => {
    console.log("Verifying email with token:", token); // Added log

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/verify-email/${token}`);
        const data = await response.json();
        console.log(data);

        if (response.ok && data.message === 'Email verified successfully.') { // Check for a success flag in response
          console.log("Verification successful, received data:", data); // Added log
          setStatus('success');
          setUserId(data.userId);
        } else {
          console.log("Verification failed, received data:", data); // Added log
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
          oldPassword: oldPassword, // Assuming oldPassword is not needed after email verification
          newPassword: newPassword,
        },
      });

      if (data.changePassword) {
        console.log('Password changed successfully');
        window.location.href = '/login';
      } else {
        console.log('Failed to change password');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const passwordsMatch = newPassword === confirmNewPassword && newPassword !== ''; // New variable to check if passwords match

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
          <p>Please confirm your new password:</p>
          <input
            type="password"
            placeholder="confirm Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange} disabled={!passwordsMatch}>Change Password</button>
          {!passwordsMatch && <p>Passwords do not match!</p>}
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
