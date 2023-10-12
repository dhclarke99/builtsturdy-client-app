import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const Verification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/verify-email/${token}`);
        if (response.ok) {
          setStatus('success');
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
    // Logic to change the password
    // Make sure to call your API to actually change the password
  };

  return (
    <div>
      {status === 'verifying' && <p>Verifying your email...</p>}

      {status === 'success' && (
        <div>
          <p>Email verified successfully!</p>
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
