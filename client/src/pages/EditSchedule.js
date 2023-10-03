import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { FETCH_SCHEDULE_BY_ID, FETCH_ALL_WORKOUTS, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import { UPDATE_SCHEDULE } from '../utils/mutations';
import { swapArrayElements } from '../utils/helpers';

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
  const [allWorkouts, setAllWorkouts] = useState([]);
  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
});

const [workoutDetails, setWorkoutDetails] = useState([]);
const [sortedWorkouts, setSortedWorkouts] = useState([]);
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
  
  useEffect(() => {
    
      if (dataSchedule && dataSchedule.schedule &&dataSchedule.schedule.workouts) {
    console.log(dataSchedule)

        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
        const newSortedWorkouts = [...dataSchedule.schedule.workouts].sort((a, b) => {
          return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
        });
  
        setSortedWorkouts(newSortedWorkouts);
      }
    
  }, [dataSchedule]);
console.log(sortedWorkouts)
  // Initialize state variables once data is available
  useEffect(() => {
    if (dataSchedule) {
      setName(dataSchedule.schedule.name || '');
      setNotes(dataSchedule.schedule.notes || '');
      setAllWorkoutIds(dataSchedule.schedule.workouts.map(e => e._id));
      setAllWorkouts(dataSchedule.schedule.workouts); // <-- Add this line
    }
  }, [dataSchedule]);

  

  if (loading || loadingWorkouts) return <p>Loading...</p>;
  if (error || errorWorkouts) return <p>Error: {error?.message || errorWorkouts?.message}</p>;


  const handleUpdateWorkout = async () => {
    try {
      const newWorkout = {
        workoutId: selectedWorkout,
        day: selectedWorkoutDay
      };
  
      // Add the new workout to the existing list of workouts
      let updatedWorkouts = [...allWorkouts];
      if (newWorkout.workoutId !== "") {
        updatedWorkouts.push(newWorkout);
      }
  
      const cleanedWorkouts = updatedWorkouts.map(({ workoutId, day }) => ({ workoutId, day }));
  
      // Update the local state
      setAllWorkouts(updatedWorkouts);
  
      const input = {
        name,
        notes,
        workouts: cleanedWorkouts
      };
  
      await updateSchedule({ variables: { scheduleId, input } });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleRemoveWorkout = async (workoutIdToRemove) => {
    try {
      const updatedWorkouts = allWorkouts.filter(workout => workout.workoutId !== workoutIdToRemove);
      const cleanedWorkouts = updatedWorkouts.map(({ workoutId, day }) => ({ workoutId, day }));
  
      // Update the local state
      setAllWorkouts(updatedWorkouts);
  
      const input = {
        name,
        notes,
        workouts: cleanedWorkouts
      };
  
      await updateSchedule({ variables: { scheduleId, input } });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  
  
  

  const handleEditWorkout = async (workoutIdToEdit) => {
    console.log(workoutIdToEdit)
  }


  

  

  
console.log(dataSchedule)
  return (
    <div>
      <h1>Edit Schedule</h1>
      <h2>{dataSchedule.schedule.name}</h2>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Notes:
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label>
        Current Workouts:
        <ul>
        {sortedWorkouts.map((workout, index) => {
                  const relevantWorkoutDetail = workoutDetails.find(
                    (detail) => detail && detail.workout && detail.workout._id === workout.workoutId
                  );
                  
                  return (
                    <li className="list-group-item" key={index}>
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
        <select value={selectedWorkoutDay} onChange={(e) => setSelectedWorkoutDay(e.target.value)}>
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
      <button onClick={handleUpdateWorkout}>Update Schedule</button>
    </div>
  );
};

export default EditSchedule;
