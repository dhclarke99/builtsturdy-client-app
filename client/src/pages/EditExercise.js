import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FIND_EXERCISE_BY_ID } from '../utils/queries';
import { UPDATE_EXERCISE } from '../utils/mutations';

const EditExercise = () => {
  const { id: exerciseId } = useParams();
  const { loading, error, data } = useQuery(FIND_EXERCISE_BY_ID, {
    variables: { exerciseId },
  });
 

  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');

  const [updateExercise] = useMutation(UPDATE_EXERCISE);

  useEffect(() => {
    if (data) {
      setName(data.exercise.name || '');
      setSets(data.exercise.sets || '');
      setReps(data.exercise.reps || '');
      setNotes(data.exercise.notes || '');
      setWeight(data.exercise.weight || '');  // Use empty string if weight is null
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error?.message}</p>;


  const handleUpdateName = async () => {
    try {
      
      await updateExercise({ variables: { exerciseId: exerciseId.toString(), name } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSets = async () => {
    try {
      
      await updateExercise({ variables: { exerciseId: exerciseId.toString(), sets: parseInt(sets) } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReps = async () => {
    try {
      
      await updateExercise({ variables: { exerciseId: exerciseId.toString(), reps: parseInt(reps) } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWeight = async () => {
    try {
      
      await updateExercise({ variables: { exerciseId: exerciseId.toString(), weight: parseInt(weight) } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      
      await updateExercise({ variables: { exerciseId: exerciseId.toString(), notes } });
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
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleUpdateName}>Update Name</button>
      </label>
      <label>
        Sets:
        <input type="text" value={sets} onChange={(e) => setSets(e.target.value)} />
        <button onClick={handleUpdateSets}>Update Sets</button>
      </label>
      <label>
        Reps:
        <input type="text" value={reps} onChange={(e) => setReps(e.target.value)} />
        <button onClick={handleUpdateReps}>Update Reps</button>
      </label>
      <label>
        Weight:
        <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <button onClick={handleUpdateWeight}>Update Weight</button>
      </label>
      <label>
        Notes:
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={handleUpdateNotes}>Update Notes</button>
      </label>
    </div>
  );
};

export default EditExercise;
