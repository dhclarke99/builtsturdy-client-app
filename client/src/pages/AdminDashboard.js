// pages/AdminDashboard.js
import React from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_ALL_WORKOUTS } from '../utils/queries';

const AdminDashboard = () => {
  const { loading, error, data } = useQuery(FETCH_ALL_WORKOUTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
        {data.workouts.map((workout) => (
          <li key={workout.id}>
            {workout.name} - {workout.notes}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
