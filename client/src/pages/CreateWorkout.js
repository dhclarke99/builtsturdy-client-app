// pages/CreateWorkout/index.js
import React, { useState } from 'react';

const CreateWorkout = () => {
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Logic to create a new workout
  };

  return (
    <div>
      <h1>Create New Workout</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Workout Name" 
          value={workoutName} 
          onChange={(e) => setWorkoutName(e.target.value)} 
        />
        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <button type="submit">Create Workout</button>
      </form>
    </div>
  );
};

export default CreateWorkout;
