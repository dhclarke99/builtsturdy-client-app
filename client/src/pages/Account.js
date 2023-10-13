import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth';
import { CHANGE_PASSWORD } from '../utils/mutations';

const Account = () => {
    const { loading, error, data } = useQuery(QUERY_USER_by_id, {
        variables: { userId: Auth.getProfile().data._id },
      });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [changePassword] = useMutation(CHANGE_PASSWORD);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      console.error("New passwords don't match");
      return;
    }

    try {
      const { data } = await changePassword({
        variables: {
          // userId and other variables
          userId: Auth.getProfile().data._id,
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      });
      if (data.changePassword) {
        console.log('Password changed successfully');
        alert("success!")
      } else {
        console.log('Failed to change password');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
        value={formData.currentPassword}
        onChange={handleChange}
      />
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={formData.newPassword}
        onChange={handleChange}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      <button type="submit" disabled={formData.newPassword !== formData.confirmPassword}>
        Change Password
      </button>
    </form>
  );
};

export default Account;
