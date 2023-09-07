import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FETCH_WORKOUT_BY_ID, QUERY_EXERCISES } from '../utils/queries';
import { ASSIGN_EXERCISE_TO_WORKOUT, UPDATE_WORKOUT_NOTES } from '../utils/mutations';

const EditWorkout = () => {
  const { id: workoutId } = useParams();
  const { loading, error, data } = useQuery(FETCH_WORKOUT_BY_ID, {
    variables: { workoutId },
  });
  const { loading: loadingExercises, error: errorExercises, data: dataExercises } = useQuery(QUERY_EXERCISES);
  const [assignExerciseToWorkout] = useMutation(ASSIGN_EXERCISE_TO_WORKOUT);

  const [notes, setNotes] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [updateWorkoutNotes] = useMutation(UPDATE_WORKOUT_NOTES);

  if (loading || loadingExercises) return <p>Loading...</p>;
  if (error || errorExercises) return <p>Error: {error?.message || errorExercises?.message}</p>;

  const handleAssignExercise = async () => {
    try {
      await assignExerciseToWorkout({ variables: { workoutId, exerciseId: selectedExercise } });
      // Optionally, refresh the component to show the newly assigned exercise
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      await updateWorkoutNotes({ variables: { workoutId, notes } });
      // Optionally, refresh the component to show the updated notes
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
        <button onClick={handleUpdateNotes}>Update Notes</button>
      </label>
      <label>
        Assign Exercise:
        <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
          <option value="" disabled>Select an exercise</option>
          {dataExercises.exercises.map((exercise) => (
            <option key={exercise._id} value={exercise._id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleAssignExercise}>Assign Exercise</button>
    </div>
  );
};

export default EditWorkout;
