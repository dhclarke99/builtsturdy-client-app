import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_WORKOUT } from '../utils/mutations';
import '../utils/css/EditForms.css'

const CreateWorkout = () => {
  const [workoutData, setWorkoutData] = useState({ name: '' });
  const [createWorkout] = useMutation(CREATE_WORKOUT);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setWorkoutData({ ...workoutData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createWorkout({ variables: { name: workoutData.name } });
      // Redirect or show success message
      window.location.href = '/admin/admindashboard';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='edit-form-container'>
      <h1 className="form-title">Create Workout</h1>
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          Workout Name:
          <input className="form-input" type="text" name="name" value={workoutData.name} onChange={handleInputChange} />
        </label>
        <button className="form-button" type="submit">Create Workout</button>
      </form>
    </div>
  );
};

export default CreateWorkout;
