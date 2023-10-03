import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FETCH_WORKOUT_BY_ID, QUERY_EXERCISES } from '../utils/queries';
import { UPDATE_WORKOUT } from '../utils/mutations';
import { swapArrayElements } from '../utils/helpers';

const EditWorkout = () => {
  const { id: workoutId } = useParams();
  const { loading, error, data } = useQuery(FETCH_WORKOUT_BY_ID, {
    variables: { workoutId },
  });
  const { loading: loadingExercises, error: errorExercises, data: dataExercises } = useQuery(QUERY_EXERCISES);


  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [updateWorkout] = useMutation(UPDATE_WORKOUT);
  const [allExercises, setAllExercises] = useState([]);
  const [sets, setSets] = useState(3); // default to 3 sets
  const [targetReps, setTargetReps] = useState('8-10'); // default to '8-10' reps

  // Initialize state variables once data is available
  useEffect(() => {
    if (data) {
      setName(data.workout.name);
      setNotes(data.workout.notes);
      setAllExercises(data.workout.exercises); // Updated to hold more details
    }
  }, [data]);
  console.log(allExercises)

  console.log(data)

  if (loading || loadingExercises) return <p>Loading...</p>;
  if (error || errorExercises) return <p>Error: {error?.message || errorExercises?.message}</p>;

  const handleUpdateWorkout = async () => {
    try {
      // Prepare the exercises array for the mutation
      const preparedExercises = allExercises.map(ex => ({
        exercise: ex.exercise._id, // Only include the ID
        sets: ex.sets,
        targetReps: ex.targetReps,
      }));
  
      if (selectedExercise !== "") {
        const updatedExercises = [...preparedExercises, { exercise: selectedExercise, sets, targetReps }];
        await updateWorkout({ variables: { workoutId, input: { name, notes, exercises: updatedExercises } } });
        window.location.reload();
      } else {
        await updateWorkout({ variables: { workoutId, input: { name, notes, exercises: preparedExercises } } });
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  const handleRemoveExercise = async (exerciseIdToRemove) => {
    const updatedExercises = allExercises.filter(ex => ex.exercise._id !== exerciseIdToRemove);
  
    // Prepare the exercises array for the mutation
    const preparedExercises = updatedExercises.map(ex => ({
      exercise: ex.exercise._id, // Only include the ID
      sets: ex.sets,
      targetReps: ex.targetReps,
    }));
  
    try {
      await updateWorkout({ variables: { workoutId, input: { exercises: preparedExercises } } });
      setAllExercises(updatedExercises); // Update the state after successful mutation
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  

  const moveExerciseUp = async (index) => {
    if (index > 0) {
      const newExercises = swapArrayElements([...allExercises], index, index - 1);
      setAllExercises(newExercises);
      await updateWorkout({ variables: { workoutId, input: { exercises: newExercises } } });
      window.location.reload();
    }
  };


  const moveExerciseDown = async (index) => {
    if (index < allExercises.length - 1) {
      const newExercises = swapArrayElements([...allExercises], index, index + 1);
      setAllExercises(newExercises);
      await updateWorkout({ variables: { workoutId, input: { exercises: newExercises } } });
      window.location.reload();
    }
  };

  console.log(data)

  return (
    <div>
      <h1>Edit Workout</h1>
      <h2>{data.workout.name}</h2>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      </label>
      <label>
        Notes:
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />

      </label>
      <label>
        Current Exercises:
        <ul>
          {data.workout.exercises.map((exercise, index) => (
            <li key={exercise.exercise._id}>
              {exercise.exercise.name}: {exercise.sets} sets of {exercise.targetReps} reps
              <button onClick={() => handleRemoveExercise(exercise.exercise._id)}>Remove</button>
              <button onClick={() => moveExerciseUp(index)}>Move Up</button>
              <button onClick={() => moveExerciseDown(index)}>Move Down</button>
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
      <label>
        Sets:
        <input type="number" value={sets} onChange={(e) => setSets(parseInt(e.target.value, 10))} />
      </label>
      <label>
        Target Reps:
        <input type="text" value={targetReps} onChange={(e) => setTargetReps(e.target.value)} />
      </label>
      <button onClick={handleUpdateWorkout}>Update Workout </button>
    </div>
  );
};

export default EditWorkout;
