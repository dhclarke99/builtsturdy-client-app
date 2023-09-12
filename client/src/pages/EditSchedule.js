import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FETCH_SCHEDULE_BY_ID, FETCH_ALL_WORKOUTS, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import { UPDATE_SCHEDULE } from '../utils/mutations';

const EditSchedule = () => {
  const { id: scheduleId } = useParams();
  const { loading, error, data: dataSchedule } = useQuery(FETCH_SCHEDULE_BY_ID, {
    variables: { scheduleId },
  });
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const [updateSchedule] = useMutation(UPDATE_SCHEDULE);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState('');
  const [allWorkoutIds, setAllWorkoutIds] = useState([]);
  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
});

const [workoutDetails, setWorkoutDetails] = useState([]);
console.log("data:", dataSchedule)

useEffect(() => {
    if (dataSchedule && dataSchedule.schedule && Array.isArray(dataSchedule.schedule.workouts)) {
      const workoutIds = dataSchedule.schedule.workouts.map(w => w.workoutId);
  
      const fetchWorkoutDetails = async () => {
        const details = await Promise.all(workoutIds.map(async workoutId => {
          const { data } = await client.query({
            query: FETCH_WORKOUT_BY_ID,
            variables: { workoutId: workoutId.toString() },
          });
          return data;
        }));
        setWorkoutDetails(details);
      };
  
      fetchWorkoutDetails();
    }
  }, [dataSchedule]);
  

  // Initialize state variables once data is available
  useEffect(() => {
    if (dataSchedule) {
      setName(dataSchedule.schedule.name);
      setNotes(dataSchedule.schedule.notes);
      setAllWorkoutIds(dataSchedule.schedule.workouts.map(e => e._id));
    }
  }, [dataSchedule]);

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

  const handleEditWorkout = async (workoutIdToEdit) => {
    console.log(workoutIdToEdit)
  }

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
console.log(dataSchedule)
  return (
    <div>
      <h1>Edit Schedule</h1>
      <h2>{dataSchedule.schedule.name}</h2>
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
        {dataSchedule.schedule.workouts.map((workout) => {
                  const relevantWorkoutDetail = workoutDetails.find(
                    (detail) => detail.workout._id === workout.workoutId
                  );
                  return (
                    <li className="list-group-item" key={workout.workoutId}>
                      <strong>Day:</strong> {workout.day}, <strong>Workout ID:</strong> {workout.workoutId}
                      {relevantWorkoutDetail && (
                        <ul className="list-group list-group-flush mt-2">
                          <li className="list-group-item">Name: {relevantWorkoutDetail.workout.name}</li>
                          <li className="list-group-item">Notes: {relevantWorkoutDetail.workout.notes}</li>
                        </ul>
                      )}
                      <button onClick={() => handleEditWorkout(workout.workoutId)}>Edit</button>
                      <button onClick={() => handleRemoveWorkout(workout.workoutId)}>Remove</button>
                    </li>
                     
                  );
                })}
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
        <label> Select Day:
        <select>
            <option value="" disabled>Select a day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
        </select>
        </label>
        
      </label>
      <button onClick={handleAssignWorkout}>Assign Workout</button>
    </div>
  );
};

export default EditSchedule;
