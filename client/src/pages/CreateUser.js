import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../utils/mutations';
import { sendVerificationEmail } from '../utils/helpers';
import '../utils/css/EditForms.css'

const AdminCreateUser = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    role: '', // default role
    gender: '',
    height: '',
    currentWeight: '',
    estimatedBodyFat: '',
    age: '',
    trainingExperience: '',
    mainPhysiqueGoal: '',
    startDate: '',
    weeks: ''
  });

  const [createUser] = useMutation(CREATE_USER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      estimatedBodyFat: parseFloat(formData.estimatedBodyFat),
      age: parseInt(formData.age, 10),
      weeks: parseFloat(formData.weeks),
    };

    const tempPassword = 'password123'; // This should be generated securely

    try {
      const { data } = await createUser({
        variables: { input: { ...formattedData, password: tempPassword } }, // Use tempPassword here
      });

      await sendVerificationEmail(
        data.createUser.user.email,
        data.createUser.user.emailVerificationToken,
        data.createUser.user.firstname,
        tempPassword
      );

      window.location.href = '/admin/admindashboard';
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  return (
    <div className='edit-form-container'>
      <h1 className="form-title">Create User</h1>
    <form onSubmit={handleSubmit}>
      {/* Existing Fields */}
      <input
      className="form-input"
        type="text"
        name="firstname"
        placeholder="First Name"
        value={formData.firstname}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="text"
        name="lastname"
        placeholder="Last Name"
        value={formData.lastname}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
     
     <label className="form-label"> Role:
      <select name="role" value={formData.role} onChange={handleChange}>
      <option className="form-input" value="" disabled>Choose a role</option>
        <option value="User">User</option>
        <option value="Admin">Admin</option>
      </select>
      </label>

      {/* New Fields */}
      <input
      className="form-input"
        type="text"
        name="gender"
        placeholder="Gender"
        value={formData.gender}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="number"
        name="height"
        placeholder="Height (inches)"
        value={formData.height}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="number"
        name="currentWeight"
        placeholder="Current Weight (lbs)"
        value={formData.currentWeight}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="number"
        name="estimatedBodyFat"
        placeholder="Estimated Body Fat (%)"
        value={formData.estimatedBodyFat}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="number"
        name="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
      />
      <select className="form-input" name="trainingExperience" value={formData.trainingExperience} onChange={handleChange}>
        <option value="">Select Training Experience</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
      </select>
      <select className="form-input" name="mainPhysiqueGoal" value={formData.mainPhysiqueGoal} onChange={handleChange}>
        <option value="">Select Main Physique Goal</option>
        <option value="Burn Fat">Burn Fat</option>
        <option value="Build Muscle">Build Muscle</option>
        <option value="Recomp">Recomp</option>
      </select>
      <input
      className="form-input"
        type="text"
        name="startDate"
        placeholder="Start Date (MM/DD/YYYY)"
        value={formData.startDate}
        onChange={handleChange}
      />
      <input
      className="form-input"
        type="number"
        name="weeks"
        placeholder="weeks"
        value={formData.weeks}
        onChange={handleChange}
      />

      <button className="form-button" type="submit">Create User</button>
    </form>
    </div>
  );
};

export default AdminCreateUser;
