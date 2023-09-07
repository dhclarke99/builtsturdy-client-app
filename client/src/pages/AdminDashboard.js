// pages/AdminDashboard.js
import React from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_ALL_WORKOUTS, FETCH_ALL_USERS } from '../utils/queries';

const AdminDashboard = () => {
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const { loading: loadingUsers, error: errorUsers, data: dataUsers } = useQuery(FETCH_ALL_USERS);

  if (loadingWorkouts || loadingUsers) return <p>Loading...</p>;
  if (errorWorkouts || errorUsers) return <p>Error: {errorWorkouts?.message || errorUsers?.message}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><a href="/create-workout">Create Workout</a></li>
          <li><a href="/assign-workout">Assign Workout</a></li>
        </ul>
      </nav>
      <h2>All Workouts</h2>
      <ul>
        {dataWorkouts.workouts.map((workout) => (
          <li key={workout._id}>
            {workout.name} - {workout.notes}
            <ul>
            {workout.exercises.map((exercise) => (
          <li key={exercise._id}>
            {exercise.name}: Sets - {exercise.sets}, reps - {exercise.reps}
          </li>
        ))}
            </ul>
          </li>
        ))}
      </ul>
      <h2>All Users</h2>
      <ul>
        {dataUsers.users.map((user) => (
          <li key={user._id}>
            {user.email} - {user.firstname} {user.lastname}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
