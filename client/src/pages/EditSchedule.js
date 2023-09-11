import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FETCH_SCHEDULE_BY_ID, FETCH_ALL_WORKOUTS } from '../utils/queries';
import { UPDATE_SCHEDULE } from '../utils/mutations';

const EditSchedule = () => {
  const { id: scheduleId } = useParams();
  const { loading, error, data } = useQuery(FETCH_SCHEDULE_BY_ID, {
    variables: { scheduleId },
  });
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const [updateSchedule] = useMutation(UPDATE_SCHEDULE);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [allWorkoutIds, setAllWorkoutIds] = useState([]);

  // Initialize state variables once data is available
  useEffect(() => {
    if (data) {
      setName(data.schedule.name);
      setNotes(data.schedule.notes);
      setAllWorkoutIds(data.schedule.workouts.map(e => e._id));
    }
  }, [data]);

  if (loading || loadingWorkouts) return <p>Loading...</p>;
  if (error || errorWorkouts) return <p>Error: {error?.message || errorWorkouts?.message}</p>;

  const handleAssignWorkout = async () => {
    try {
      const updatedWorkoutIds = [...allWorkoutIds, selectedWorkout];
      setAllWorkoutIds(updatedWorkoutIds); // Update the local state
      await updateSchedule({ variables: { scheduleId, workoutIds: updatedWorkoutIds } });
      // Optionally, refresh the component to show the newly assigned exercise
      window.location.href = '/admindashboard';
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWorkout = async (workoutIdToRemove) => {
    try {
      const updatedWorkoutIds = allWorkoutIds.filter(id => id !== workoutIdToRemove);
      setAllWorkoutIds(updatedWorkoutIds); // Update the local state
      await updateSchedule({ variables: { scheduleId, workoutIds: updatedWorkoutIds } });
      // Optionally, refresh the component to show the updated list of exercises
      window.location.reload()
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      
      await updateSchedule({ variables: { scheduleId: scheduleId.toString(), notes } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateName = async () => {
    try {
      
      await updateSchedule({ variables: { scheduleId: scheduleId.toString(), name } });
      // Optionally, refresh the component to show the updated notes
    } catch (err) {
      console.error(err);
    }
  };
console.log(data)
  return (
    <div>
      <h1>Edit Schedule</h1>
      <h2>{data.schedule.name}</h2>
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
        Current Workouts:
        <ul>
          {data.schedule.workouts.map((workout) => (
            <li key={workout.workoutId}>
              {workout.day} 
              <button onClick={() => handleRemoveWorkout(workout._id)}>Remove</button>
            </li>
          ))}
        </ul>
      </label>
      <label>
        Assign Workout:
        <select value={selectedWorkout} onChange={(e) => setSelectedWorkout(e.target.value)}>
          <option value="" disabled>Select a workout</option>
          {dataWorkouts.workouts.map((workout) => (
            <option key={workout._id} value={workout._id}>
              {workout.name}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleAssignWorkout}>Assign Workout</button>
    </div>
  );
};

export default EditSchedule;
