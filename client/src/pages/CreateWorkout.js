// pages/CreateWorkout.js
import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_WORKOUT } from '../utils/mutations';  // You'll need to define this mutation
import { QUERY_EXERCISES } from '../utils/queries';

const CreateWorkout = () => {
  const [workoutData, setWorkoutData] = useState({ name: '', notes: '', exercises: [] });
  const [createWorkout] = useMutation(CREATE_WORKOUT);
  const { loading, error, data } = useQuery(QUERY_EXERCISES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setWorkoutData({ ...workoutData, [name]: value });
  };

  const handleExerciseSelect = (event) => {
    const selectedExercise = event.target.value;
    setWorkoutData({ ...workoutData, exercises: [...workoutData.exercises, selectedExercise] });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createWorkout({ variables: { ...workoutData } });
      // Redirect or show success message
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Create Workout</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Workout Name:
          <input type="text" name="name" value={workoutData.name} onChange={handleInputChange} />
        </label>
        <label>
          Notes:
          <input type="text" name="notes" value={workoutData.notes} onChange={handleInputChange} />
        </label>
        <label>
          Add Exercise:
          <select onChange={handleExerciseSelect}>
            {data.exercises.map((exercise) => (
              <option key={exercise._id} value={exercise._id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create Workout</button>
      </form>
    </div>
  );
};

export default CreateWorkout;
