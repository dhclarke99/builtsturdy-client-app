import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CHANGE_PASSWORD } from '../utils/mutations';

const Verification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('Verifying...');
  const [userId, setUserId] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('Email verified successfully!');
          setUserId(data.userId); // Set userId for further operations
        } else {
          setStatus('Verification failed.');
        }
      } catch (error) {
        console.error('There was an error verifying the email:', error);
        setStatus('Verification failed.');
      }
    };

    verifyEmail();
  }, [token]);

  const handlePasswordChange = async () => {
    try {
      const { data } = await changePassword({
        variables: {
          userId,
          oldPassword,
          newPassword,
        },
      });

      if (data.changePassword) {
        console.log('Password changed successfully');
        window.location.href = ('/login')
      } else {
        console.log('Failed to change password');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const passwordsMatch = newPassword === confirmNewPassword && newPassword !== '';

  return (
    <div>
      <h1>{status}</h1>
      {status === 'Email verified successfully!' && userId && (
        <div>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange} disabled={!passwordsMatch}>
            Change Password
          </button>
          {!passwordsMatch && <p>Passwords do not match!</p>}
        </div>
      )}
    </div>
  );
};

export default Verification;
