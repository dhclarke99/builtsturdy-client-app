import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth';
import { CHANGE_PASSWORD } from '../utils/mutations';
import '../utils/css/account.css'

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

  const unixToString = (startDate) => {

    const convertedStartDate = new Date(parseInt(startDate))
    return `${convertedStartDate.getMonth() + 1}/${convertedStartDate.getDate()}/${convertedStartDate.getFullYear()}`;

  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <div className='account-settings'>
        <h1>{data.user.firstname}'s Account Settings</h1>
        <h2>Your Information</h2>
        <li>First Name: {data.user.firstname}</li>
        <li>Last Name: {data.user.lastname}</li>
        <li>Email: {data.user.email}</li>
        <li>Age: {data.user.age}</li>
        <li>Gender: {data.user.gender}</li>
        <li>Height: {data.user.height}</li>
        <li>Weight: {data.user.currentWeight}</li>
        <li>Body Fat: {data.user.estimatedBodyFat}</li>
        <li>Experience: {data.user.trainingExperience}</li>
        <li>Goal: {data.user.mainPhysiqueGoal}</li>
        <li>Program Start Date: {unixToString(parseInt(data.user.startDate))}</li>
        <li>Program Length: {data.user.weeks} weeks</li>
        <li>Current Schedule: {data.user.schedule.name} weeks</li>
      </div>
      <div className='password-form-container'>
        <h3 id='update-password-title'>Update Password</h3>
        <form onSubmit={handleSubmit} id='password-form'>
          <div className="form-group">
            <label className="password-form-label">Enter Current Password
              <input
              className='password-form-input'
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
              />

            </label >
          </div>
          <div className="form-group">
            <label className="password-form-label">Enter New Password
              <input
              className='password-form-input'
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="password-form-label">Confirm New Password
            <input
            className='password-form-input'
              type="password"
              name="confirmPassword"
              placeholder="New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </label>

          <button type="submit" id='change-password-button' disabled={formData.newPassword !== formData.confirmPassword}>
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;
