import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FETCH_WORKOUT_BY_ID, QUERY_EXERCISES } from '../utils/queries';
import { UPDATE_WORKOUT } from '../utils/mutations';

const EditWorkout = () => {
  const { id: workoutId } = useParams();
  const { loading, error, data } = useQuery(FETCH_WORKOUT_BY_ID, {
    variables: { workoutId },
  });
  const { loading: loadingExercises, error: errorExercises, data: dataExercises } = useQuery(QUERY_EXERCISES);
  const [assignExerciseToWorkout] = useMutation(UPDATE_WORKOUT);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [updateWorkoutNotes] = useMutation(UPDATE_WORKOUT);
  const [allExerciseIds, setAllExerciseIds] = useState([]);

  // Initialize state variables once data is available
  useEffect(() => {
    if (data) {
      setName(data.workout.name);
      setNotes(data.workout.notes);
      setAllExerciseIds(data.workout.exercises.map(e => e._id));
    }
  }, [data]);

  if (loading || loadingExercises) return <p>Loading...</p>;
  if (error || errorExercises) return <p>Error: {error?.message || errorExercises?.message}</p>;

  const handleAssignExercise = async () => {
    try {
      const updatedExerciseIds = [...allExerciseIds, selectedExercise];
      setAllExerciseIds(updatedExerciseIds); // Update the local state
      await assignExerciseToWorkout({ variables: { workoutId, exerciseIds: updatedExerciseIds } });
      // Optionally, refresh the component to show the newly assigned exercise
      window.location.href = '/admin/admindashboard';
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveExercise = async (exerciseIdToRemove) => {
    try {
      const updatedExerciseIds = allExerciseIds.filter(id => id !== exerciseIdToRemove);
      setAllExerciseIds(updatedExerciseIds); // Update the local state
      await assignExerciseToWorkout({ variables: { workoutId, exerciseIds: updatedExerciseIds } });
      // Optionally, refresh the component to show the updated list of exercises
      window.location.reload()
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      
      await updateWorkoutNotes({ variables: { workoutId: workoutId.toString(), notes } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateName = async () => {
    try {
      
      await updateWorkoutNotes({ variables: { workoutId: workoutId.toString(), name } });
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
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleUpdateName}>Update Name</button>
      </label>
      <label>
        Notes:
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={handleUpdateNotes}>Update Notes</button>
      </label>
      <label>
        Current Exercises:
        <ul>
          {data.workout.exercises.map((exercise) => (
            <li key={exercise._id}>
              {exercise.name} 
              <button onClick={() => handleRemoveExercise(exercise._id)}>Remove</button>
            </li>
          ))}
        </ul>
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
