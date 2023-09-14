import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { FETCH_ALL_WORKOUTS, FETCH_ALL_USERS, QUERY_EXERCISES, FETCH_SCHEDULES, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import { DELETE_WORKOUT, DELETE_EXERCISE } from '../utils/mutations';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const { loading: loadingUsers, error: errorUsers, data: dataUsers } = useQuery(FETCH_ALL_USERS);
  const { loading: loadingExercises, error: errorExercises, data: dataExercises } = useQuery(QUERY_EXERCISES);
  const { loading: loadingSchedules, error: errorSchedules, data: dataSchedules } = useQuery(FETCH_SCHEDULES);
  const [deleteWorkout] = useMutation(DELETE_WORKOUT, {
    refetchQueries: [{ query: FETCH_ALL_WORKOUTS }],
  });
  const [deleteExercise] = useMutation(DELETE_EXERCISE, {
    refetchQueries: [{ query: QUERY_EXERCISES }],
  });
  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
});
  const [workoutDetails, setWorkoutDetails] = useState([]);
console.log(dataSchedules)
useEffect(() => {
  if (dataSchedules) {
      const workoutIds = dataSchedules.schedules.flatMap(schedule => schedule.workouts.map(w => w.workoutId));

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
}, [dataSchedules]);

  const handleDeleteWorkout = async (workoutId) => {
    try {
      await deleteWorkout({ variables: { workoutId } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await deleteExercise({ variables: { exerciseId } });
      window.location.href = "/admin/admindashboard"
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingWorkouts || loadingUsers || loadingExercises) return <p>Loading...</p>;
  if (errorWorkouts || errorUsers || errorExercises) return <p>Error: {errorWorkouts?.message || errorUsers?.message || errorExercises?.message}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <button onClick={() => setActiveTab('users')}>Users</button>
          <button onClick={() => setActiveTab('schedules')}>Schedules</button>
          <button onClick={() => setActiveTab('workouts')}>Workouts</button>
          <button onClick={() => setActiveTab('exercises')}>Exercises</button>
          
        </ul>
      </nav>

      {activeTab === 'schedules' && (
  <div>
    <h2>All Schedules</h2>
    <div className="row">
      {dataSchedules.schedules.map((schedule) => (
        <div className="col-md-6" key={schedule._id}>
          <div className="card mb-4">
            <div className="card-header">
              {schedule.name}: {schedule.notes}
            </div>
            <button onClick={() => window.location.href = `/admin/edit-schedule/${schedule._id}`}>Edit</button>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {schedule.workouts.map((workout) => {
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
                          <li className="list-group-item">
                            Exercises:
                            <ul className="list-group list-group-flush mt-2">
                              {relevantWorkoutDetail.workout.exercises.map((exercise, index) => (
                                <li className="list-group-item" key={index}>Exercise: {exercise.name}</li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        
      ))}
    </div>
    <Link to={`/admin/create-schedule`}>
        <button>Create Schedule</button>
        </Link>
  </div>
)}


      {activeTab === 'workouts' && (
        <div>
          <h2>All Workouts</h2>
          {/* Your Workouts code here */}
          <ul>
            {dataWorkouts.workouts.map((workout) => (
              <li key={workout._id}>
                {workout.name} - {workout.notes}
                <button onClick={() => handleDeleteWorkout(workout._id)}>Delete</button>
                <button onClick={() => window.location.href = `/admin/edit-workout/${workout._id}`}>Edit</button>
                <ul>
                  {workout.exercises ? workout.exercises.map((exercise) => (
                    <li key={exercise._id}>
                      {exercise.name}: Sets - {exercise.sets}, reps - {exercise.reps}
                    </li>
                  )) : <li>No Exercises assigned</li>}
                </ul>
              </li>
            ))}
          </ul>
          <Link to={`/admin/create-workout`}>
        <button>Create Workout</button>
        </Link>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2>All Users</h2>
          {/* Your Users code here */}
          <div className="row">
            {dataUsers.users.map((user) => (
              <div className="col-md-4" key={user._id}>
                <Link to={`/admin/user/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title">{user.firstname} {user.lastname}</h5>
                      <p className="card-text">{user.email}</p>
                      <p className="card-text">Username: {user.username}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <Link to={`/admin/create-user`}>
        <button>Create User</button>
        </Link>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div>
        <h2>All Exercises</h2>
        {/* Your Workouts code here */}
        <ul>
          {dataExercises.exercises.map((exercise) => (
            <li key={exercise._id}>
              {exercise.name} - {exercise.notes}
              <ul>
                <li>Sets: {exercise.sets}
                </li>
                <li>Reps: {exercise.reps}
                </li>
                <li>Weight: {exercise.weight}
                </li>
              </ul>
              <button onClick={() => handleDeleteExercise(exercise._id)}>Delete</button>
              <button onClick={() => window.location.href = `/admin/edit-exercise/${exercise._id}`}>Edit</button>
              <ul>
                
              </ul>
            </li>
          ))}
        </ul>
        <Link to={`/admin/create-exercise`}>
        <button>Create Exercise</button>
        </Link>
        
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;
