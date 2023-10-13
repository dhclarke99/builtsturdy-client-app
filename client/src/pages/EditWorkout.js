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
  const [adminNotes, setAdminNotes] = useState('');
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
      setAdminNotes(data.workout.adminNotes);
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
        await updateWorkout({ variables: { workoutId, input: { name, notes, adminNotes, exercises: updatedExercises } } });
        window.location.reload();
      } else {
        await updateWorkout({ variables: { workoutId, input: { name, notes, adminNotes, exercises: preparedExercises } } });
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  const handleRemoveExercise = async (exerciseIdToRemove, index = null) => {
    let updatedExercises;
  
    if (exerciseIdToRemove) {
      updatedExercises = allExercises.filter(ex => ex.exercise._id !== exerciseIdToRemove);
    } else if (index !== null) {
      updatedExercises = [...allExercises];
      updatedExercises.splice(index, 1);
    }
  
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
  
  

  const removeTypeName = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(removeTypeName);
    } else if (obj !== null && typeof obj === 'object') {
      const { __typename, ...rest } = obj;
      Object.keys(rest).forEach(key => {
        rest[key] = removeTypeName(rest[key]);
      });
      return rest;
    }
    return obj;
  };
  
  
  const moveExerciseUp = async (index) => {
    if (index > 0) {
      const newExercises = swapArrayElements([...allExercises], index, index - 1);
      setAllExercises(newExercises);
  
      const cleanedExercises = removeTypeName(newExercises).map(exercise => {
        return {
          ...exercise,
          exercise: exercise.exercise._id // Assuming '_id' is the field containing the ID
        };
      });
  
      try {
        await updateWorkout({ variables: { workoutId, input: { exercises: cleanedExercises } } });
      } catch (error) {
        console.error("Failed to update workout:", error);
      }
    }
  };
  
  const moveExerciseDown = async (index) => {
    if (index < allExercises.length - 1) {
      const newExercises = swapArrayElements([...allExercises], index, index + 1);
      setAllExercises(newExercises);
  
      const cleanedExercises = removeTypeName(newExercises).map(exercise => {
        return {
          ...exercise,
          exercise: exercise.exercise._id // Assuming '_id' is the field containing the ID
        };
      });
  
      try {
        await updateWorkout({ variables: { workoutId, input: { exercises: cleanedExercises } } });
      } catch (error) {
        console.error("Failed to update workout:", error);
      }
    }
  };
  
  
  
  
  

  console.log(data)

  return (
    <div className='form-container'>
      <h1 className="form-title">Edit Workout</h1>
      <h2>{data.workout.name}</h2>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

      </label>
      <label>
        User Notes:
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />

      </label>
      <label>
        Admin Notes:
        <input type="text" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />

      </label>
      <label>
        Current Exercises:
        <ul>
  {data.workout.exercises.map((exercise, index) => (
    exercise.exercise ? (
      <li key={exercise.exercise._id}>
        {exercise.exercise.name}: {exercise.sets} sets of {exercise.targetReps} reps  
        <button onClick={() => handleRemoveExercise(exercise.exercise._id)}>Remove</button>
        <button onClick={() => moveExerciseUp(index)}>Move Up</button>
        <button onClick={() => moveExerciseDown(index)}>Move Down</button>
      </li>
    ) : (
      <li key={index}>Exercise data missing
        <button onClick={() => handleRemoveExercise(null, index)}>Remove</button>
      </li>
    )
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
