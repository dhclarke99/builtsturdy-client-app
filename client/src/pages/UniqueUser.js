import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { QUERY_USER_by_id } from '../utils/queries';

const UniqueUser = () => {
    
  const { id } = useParams();
  
 
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: id.toString() },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const user = data.user;
  console.log(data)
  console.log(id)
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h3>{user.firstname} {user.lastname}</h3>
        </div>
        <div className="card-body">
          <h5 className="card-title">Email: {user.email}</h5>
          <h5 className="card-title">Username: {user.username}</h5>
          <h5 className="card-title">Schedules:</h5>
          <ul>
            {user.schedules.map((schedule) => (
              <li key={schedule._id}>
                <div className="card mt-2">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2 text-muted">Schedule ID: {schedule._id}</h6>
                    <h6 className="card-subtitle mb-2 text-muted">User ID: {schedule.userId}</h6>
                    <ul>
                      {schedule.workouts.map((workout) => (
                        <li key={workout.workoutId}>
                          Day: {workout.day}, Workout ID: {workout.workoutId}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UniqueUser;
