import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID } from '../utils/queries';

const UniqueUser = () => {
   
    const [workoutDetails, setWorkoutDetails] = useState([]);

    const client = new ApolloClient({
        link: createHttpLink({ uri: '/graphql' }),
        cache: new InMemoryCache(),
    });

    const { id } = useParams();
    console.log(id)

    const { loading: loadingUser, error: errorUser, data: dataUser } = useQuery(QUERY_USER_by_id, {
        variables: { userId: id.toString() },
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (dataUser) {
            const workoutIds = dataUser.user.schedules.flatMap(schedule => schedule.workouts.map(w => w.workoutId));

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
    }, [dataUser]);

    if (loadingUser) return <p>Loading...</p>;
    if (errorUser) return <p>Error: {errorUser.message}</p>;

    const user = dataUser.user;
    console.log(workoutDetails)
    console.log(user)
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
                                        <h6 className="card-subtitle mb-2 text-muted">Schedule Name: {schedule.name}</h6>
                                        <ul>
                                            {schedule.workouts.map((workout) => {
                                                const relevantWorkoutDetail = workoutDetails.find(
                                                    (detail) => detail.workout._id === workout.workoutId
                                                );
                                                return (
                                                    <li key={workout.workoutId}>
                                                        Day: {workout.day}, Workout ID: {workout.workoutId}
                                                        {relevantWorkoutDetail && (
                                                            <ul>
                                                                <li>Name: {relevantWorkoutDetail.workout.name}</li>
                                                                <li>Notes: {relevantWorkoutDetail.workout.notes}</li>
                                                                <li>
                                                                    Exercises:
                                                                    <ul>
                                                                        {relevantWorkoutDetail.workout.exercises.map((exercise, index) => (
                                                                            <li key={index}>Exercise: {exercise.name}</li>
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
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UniqueUser;
