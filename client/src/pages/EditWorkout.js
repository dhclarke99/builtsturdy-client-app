import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { FETCH_ALL_WORKOUTS } from '../utils/queries';  // Import the necessary queries and mutations
import {ASSIGN_EXERCISE_TO_WORKOUT } from '../utils/mutations'

const EditWorkout = ({ match }) => {
  const workoutId = match.params.id;
  const { loading, error, data } = useQuery(FETCH_ALL_WORKOUTS, {
    variables: { workoutId },
  });
  const [assignExerciseToWorkout] = useMutation(ASSIGN_EXERCISE_TO_WORKOUT);

  const [notes, setNotes] = useState('');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleAssignExercise = async (exerciseId) => {
    try {
      await assignExerciseToWorkout({ variables: { workoutId, exerciseId } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Edit Workout</h1>
      <h2>{data.workout.name}</h2>
      <label>
        Notes:
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {/* Add logic to assign exercises to the workout */}
    </div>
  );
};

export default EditWorkout;
