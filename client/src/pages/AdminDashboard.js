import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FETCH_ALL_WORKOUTS, FETCH_ALL_USERS } from '../utils/queries';
import { DELETE_WORKOUT } from '../utils/mutations';
import { Link } from 'react-router-dom';


const AdminDashboard = () => {
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const { loading: loadingUsers, error: errorUsers, data: dataUsers } = useQuery(FETCH_ALL_USERS);
  const [deleteWorkout] = useMutation(DELETE_WORKOUT, {
    refetchQueries: [{ query: FETCH_ALL_WORKOUTS }],
  });

  if (loadingWorkouts || loadingUsers) return <p>Loading...</p>;
  if (errorWorkouts || errorUsers) return <p>Error: {errorWorkouts?.message || errorUsers?.message}</p>;

  const handleDelete = async (workoutId) => {
    try {
      await deleteWorkout({ variables: { workoutId } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><a href="/create-workout">Create Workout</a></li>
          <li><a href="/assign-workout">Assign Workout</a></li>
          <li><a href="/create-exercise">Create Exercise</a></li>
        </ul>
      </nav>
      <h2>All Workouts</h2>
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
      <h2>All Users</h2>
      <div className="row">
    {dataUsers.users.map((user) => (
      <div className="col-md-4" key={user._id}>
        <Link to={`/user/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">{user.firstname} {user.lastname}</h5>
              <p className="card-text">{user.email}</p>
              <p className="card-text">Username: {user.username}</p>
              {/* Add more user details here */}
            </div>
          </div>
        </Link>
      </div>
    ))}
  </div>
    </div>
  );
};

export default AdminDashboard;
