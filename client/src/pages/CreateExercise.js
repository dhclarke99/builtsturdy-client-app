// pages/CreateExercise.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_EXERCISE } from '../utils/mutations';  // You'll need to define this mutation

const CreateExercise = () => {
  const [exerciseData, setExerciseData] = useState({ name: '', sets: 0, reps: 0 });
  const [createExercise] = useMutation(CREATE_EXERCISE);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setExerciseData({ ...exerciseData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const variables = {
        ...exerciseData,
        sets: parseInt(exerciseData.sets, 10),
        reps: parseInt(exerciseData.reps, 10)
      };
      await createExercise({ variables });
      window.alert("Success!")
      // Redirect or show success message
    } catch (err) {
      console.error(err);
    }
  };
  
  

  return (
    <div>
      <h1>Create Exercise</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Exercise Name:
          <input type="text" name="name" value={exerciseData.name} onChange={handleInputChange} />
        </label>
        <label>
          Sets:
          <input type="number" name="sets" value={exerciseData.sets} onChange={handleInputChange} />
        </label>
        <label>
          Reps:
          <input type="number" name="reps" value={exerciseData.reps} onChange={handleInputChange} />
        </label>
        <button type="submit">Create Exercise</button>
      </form>
    </div>
  );
};

export default CreateExercise;
