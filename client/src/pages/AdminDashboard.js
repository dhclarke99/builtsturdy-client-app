import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FETCH_ALL_WORKOUTS, FETCH_ALL_USERS, QUERY_EXERCISES } from '../utils/queries';
import { DELETE_WORKOUT } from '../utils/mutations';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('workouts');
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const { loading: loadingUsers, error: errorUsers, data: dataUsers } = useQuery(FETCH_ALL_USERS);
  const { loading: loadingExercises, error: errorExercises, data: dataExercises } = useQuery(QUERY_EXERCISES);
  const [deleteWorkout] = useMutation(DELETE_WORKOUT, {
    refetchQueries: [{ query: FETCH_ALL_WORKOUTS }],
  });
console.log(dataExercises)
  const handleDelete = async (workoutId) => {
    try {
      await deleteWorkout({ variables: { workoutId } });
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingWorkouts || loadingUsers) return <p>Loading...</p>;
  if (errorWorkouts || errorUsers) return <p>Error: {errorWorkouts?.message || errorUsers?.message}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li onClick={() => setActiveTab('workouts')}>Workouts</li>
          <li onClick={() => setActiveTab('users')}>Users</li>
          <li onClick={() => setActiveTab('exercises')}>Exercises</li>
        </ul>
      </nav>

      {activeTab === 'workouts' && (
        <div>
          <h2>All Workouts</h2>
          {/* Your Workouts code here */}
          <ul>
            {dataWorkouts.workouts.map((workout) => (
              <li key={workout._id}>
                {workout.name} - {workout.notes}
                <button onClick={() => handleDelete(workout._id)}>Delete</button>
                <button onClick={() => window.location.href = `/edit-workout/${workout._id}`}>Edit</button>
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
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2>All Users</h2>
          {/* Your Users code here */}
          <div className="row">
            {dataUsers.users.map((user) => (
              <div className="col-md-4" key={user._id}>
                <Link to={`/user/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
              <button onClick={() => handleDelete(exercise._id)}>Delete</button>
              <button onClick={() => window.location.href = `/edit-exercise/${exercise._id}`}>Edit</button>
              <ul>
                
              </ul>
            </li>
          ))}
        </ul>
        <Link to={`/create-exercise`}>
        <button>Create Exercise</button>
        </Link>
        
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;
