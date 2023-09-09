import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FIND_EXERCISE_BY_ID } from '../utils/queries';
import { UPDATE_WORKOUT } from '../utils/mutations';

const EditWorkout = () => {
  const { id: exerciseId } = useParams();
  const { loading, error, data } = useQuery(FIND_EXERCISE_BY_ID, {
    variables: { exerciseId },
  });
 
  const [assignExerciseToWorkout] = useMutation(UPDATE_WORKOUT);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [updateWorkoutNotes] = useMutation(UPDATE_WORKOUT);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error?.message}</p>;

 

  const handleUpdateNotes = async () => {
    try {
      
      await updateWorkoutNotes({ variables: { exerciseId: exerciseId.toString(), notes } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateName = async () => {
    try {
      
      await updateWorkoutNotes({ variables: { exerciseId: exerciseId.toString(), name } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Edit Exercise</h1>
      <h2>{data.exercise.name}</h2>
      <label>
        Name:
        <input type="text" value={data.exercise.name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleUpdateName}>Update Name</button>
      </label>
      <label>
        Notes:
        <input type="text" value={data.exercise.notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={handleUpdateNotes}>Update Notes</button>
      </label>
    </div>
  );
};

export default EditWorkout;
