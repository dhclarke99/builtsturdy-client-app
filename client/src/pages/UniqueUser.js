import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID, FETCH_SCHEDULES } from '../utils/queries';
import { UPDATE_USER } from '../utils/mutations';

const UniqueUser = () => {
   
    const [workoutDetails, setWorkoutDetails] = useState([]);
    const { loading: loadingSchedules, error: errorSchedules, data: dataSchedules } = useQuery(FETCH_SCHEDULES);

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

    const [formData, setFormData] = useState({});
    const [updateUser] = useMutation(UPDATE_USER);

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
      }, [dataSchedules, client]);

  useEffect(() => {
    if (dataUser && dataUser.user) {
      setFormData(dataUser.user);
    }
  }, [dataUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const { __typename, _id, workouts, schedules, ...cleanedFormData } = formData; // Remove __typename
        cleanedFormData.scheduleId = schedules._id; // Use the correct field name 'scheduleId'
        const formattedData = {
            ...cleanedFormData,
            height: parseFloat(cleanedFormData.height),
            currentWeight: parseFloat(cleanedFormData.currentWeight),
            estimatedBodyFat: parseFloat(cleanedFormData.estimatedBodyFat),
            age: parseInt(cleanedFormData.age, 10),
          };
        console.log("userid", id, "Form Data:", formattedData)
        console.log(dataSchedules)
        console.log(dataSchedules.schedules)
      await updateUser({
        variables: { userId: id, input: formattedData },
      });
      alert('User updated successfully');
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

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

    if (loadingUser || loadingSchedules) return <p>Loading...</p>;
    if (errorUser || errorSchedules) return <p>Error: {errorUser.message}</p>;

    const user = dataUser.user;
    console.log(dataSchedules)
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
                    <h5> Personal Stats:</h5>
                    <ul>
                        <li>Age: {user.age}</li>
                        <li>Gender: {user.gender}</li>
                        <li>Height: {user.height} inches</li>
                        <li>Weight: {user.currentWeight} lbs</li>
                        <li>Body Fat: {user.estimatedBodyFat} %</li>
                        <li>Experience: {user.trainingExperience}</li>
                        <li>Goal: {user.mainPhysiqueGoal}</li>
                        </ul>
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
            <div>
      <h1>Edit User</h1>
      <form onSubmit={handleSubmit}>
        {/* Add form fields here based on your schema. For example: */}
        <label> First Name:
            <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname || ''}
          onChange={handleChange}
        />
        </label>
        <label> Last Name:
            <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname || ''}
          onChange={handleChange}
        />
        </label>
        <label> Username:
            <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username || ''}
          onChange={handleChange}
        />
        </label>
        <label> Email:
            <input
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email || ''}
          onChange={handleChange}
        />
        </label>
        <label> Age:
            <input
          type="text"
          name="age"
          placeholder="Age"
          value={formData.age || ''}
          onChange={handleChange}
        />
        </label>
        <label> Gender:
            <select type="text"
          name="gender"
          placeholder="Gender"
          value={formData.gender || ''}
          onChange={handleChange}>
            <option value="Male"> Male</option>
            <option value="Female"> Female</option>
             </select>
            
        </label>
        <label> Height (inches):
            <input
          type="text"
          name="height"
          placeholder="Height"
          value={formData.height || ''}
          onChange={handleChange}
        />
        </label>
        <label> Weight (lbs):
            <input
          type="text"
          name="currentWeight"
          placeholder="Current Weight"
          value={formData.currentWeight || ''}
          onChange={handleChange}
        />
        </label>
        <label> Body Fat (%):
            <input
          type="text"
          name="estimatedBodyFat"
          placeholder="Body Fat %"
          value={formData.estimatedBodyFat || ''}
          onChange={handleChange}
        />
        </label>
        <label> Training Experience:
            <select type="text"
          name="trainingExperience"
          placeholder="Training Experience"
          value={formData.trainingExperience || ''}
          onChange={handleChange}>
            <option value='' disabled>Select One</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            </select>
           
        </label>
        <label> Phsyique Goal:
            <select type="text"
          name="mainPhysiqueGoal"
          placeholder="Phsyique Goal"
          value={formData.mainPhysiqueGoal || ''}
          onChange={handleChange}>
            <option value='' disabled>Select One</option>
            <option value='Burn Fat'>Burn Fat</option>
            <option value='Build Muscle'>Build Muscle</option>
            <option value='Recomp'>Recomp</option>
        
          </select>
           
        </label>
        <label> Schedule:
        <select name="scheduleId" onChange={handleChange}>
        <option value='' disabled>Select One</option>
            {dataSchedules?.schedules?.map((schedule)=> (
                <option key={schedule._id} value={schedule._id}>{schedule.name}</option>
            ))} 
            </select>
        </label>
        <button type="submit">Update User</button>
      </form>
    </div>
        </div>
        
    );
};

export default UniqueUser;
