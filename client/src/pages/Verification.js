import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Verification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('Email verified successfully!');
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

  return (
    <h1>
      {status}
    </h1>
  );
};

export default Verification;
