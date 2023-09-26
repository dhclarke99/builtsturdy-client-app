import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID, FETCH_SCHEDULES } from '../utils/queries';
import { UPDATE_USER, DELETE_USER } from '../utils/mutations';

const UniqueUser = () => {
  const [activeTab, setActiveTab] = useState('view info')
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const { loading: loadingSchedules, error: errorSchedules, data: dataSchedules } = useQuery(FETCH_SCHEDULES);

  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
  });

  const { id } = useParams();


  const { loading: loadingUser, error: errorUser, data: dataUser } = useQuery(QUERY_USER_by_id, {
    variables: { userId: id.toString() },
    fetchPolicy: 'network-only'
  });

  const [formData, setFormData] = useState({});
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [currentStartWeek, setCurrentStartWeek] = useState(1);

  useEffect(() => {
    console.log(dataSchedules)
    if (dataSchedules && dataSchedules.schedules) {
      const workoutIds = dataSchedules.schedules.flatMap(schedule =>
        schedule.workouts ? schedule.workouts.map(w => w.workoutId) : []
      );
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

  useEffect(() => {
    if (dataUser && dataUser.user) {
      const { schedule, ...restOfUserData } = dataUser.user;
      const formattedUser = {
        ...restOfUserData,
        schedule: schedule ? schedule._id : null,  // set only the ID
      };
      setFormData(prevState => ({ ...prevState, ...formattedUser }));
    }
  }, [dataUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    try {
      await deleteUser({
        variables: { userId: id },
      });
      window.location.href = '/admin/admindashboard';
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

      const cleanedDailyTracking = formData.dailyTracking.map(({ __typename, ...rest }) => rest);
      const { __typename, _id, ...cleanedFormData } = {...formData, dailyTracking: cleanedDailyTracking}; // Remove __typename
  
      console.log(cleanedFormData)
      const formattedData = {
        ...cleanedFormData,
        height: parseFloat(cleanedFormData.height),
        currentWeight: parseFloat(cleanedFormData.currentWeight),
        estimatedBodyFat: parseFloat(cleanedFormData.estimatedBodyFat),
        age: parseInt(cleanedFormData.age, 10),
        weeks: parseFloat(cleanedFormData.weeks),
      };
      console.log(formattedData)
      await updateUser({
        variables: { userId: id, input: formattedData },
      });

      window.location.reload()

    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  useEffect(() => {
    console.log(dataUser)
    if (dataUser && dataUser.user.schedule && Array.isArray(dataUser.user.schedule.workouts)) {
      const workoutIds = dataUser.user.schedule.workouts.map(w => w.workoutId);

      if (workoutIds && workoutIds.length > 0) {
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
    }
  }, [dataUser]);

  const weeks = {};
  if (dataUser && dataUser.user && dataUser.user.dailyTracking) {

    const sortedDailyTracking = [...dataUser.user.dailyTracking].sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(sortedDailyTracking)

    sortedDailyTracking.forEach((day, index) => {
      const dateUnix = day.date
      const weekNumber = Math.floor(index / 7) + 1;
      if (!weeks[weekNumber]) weeks[weekNumber] = {};
      weeks[weekNumber][dateUnix] = day; // Use Unix timestamp as a key
    });
  }
  console.log(weeks)

  const calculateWeekStartDate = (startDate, weekNumber) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weekNumber - 1) * 7);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const getTypeKey = (type) => {
    if (type === 'Weight') return 'weight';
    if (type === 'Calories') return 'calorieIntake';
    if (type === 'Protein') return 'proteinIntake';
  };



  if (loadingUser || loadingSchedules) return <p>Loading...</p>;
  if (errorUser || errorSchedules) return <p>Error: {errorUser.message}</p>;

  const user = dataUser.user;
  const convertedStartDate = (startDate) => {
  
    const convertedStartDate = new Date(startDate)
    return `${convertedStartDate.getMonth() + 1}/${convertedStartDate.getDate()}/${convertedStartDate.getFullYear()}`;

  }
 

  console.log(formData)
  return (

    <div className="container mt-5">
      <nav>
        <ul>
          <button onClick={() => setActiveTab('view info')}>View Info</button>
          <button onClick={() => setActiveTab('view nutrition')}>View Nutrition</button>
          <button onClick={() => setActiveTab('edit')}>Edit</button>
          <button onClick={() => setActiveTab('delete')}>Delete</button>
        </ul>
      </nav>
      {activeTab === 'view info' && (
        <div className="card">
          <div className="card-header">
            <h3>{user.firstname} {user.lastname}</h3>
          </div>
          <div className="card-body">
            <h5 className="card-title">Email: {user.email}</h5>
            <h5 className="card-title">Username: {user.username}</h5>
            <h5 className="card-title">Role: {user.role} </h5>
            <h5> Personal Stats:</h5>
            <ul>
              <li>Age: {user.age}</li>
              <li>Gender: {user.gender}</li>
              <li>Height: {user.height} inches</li>
              <li>Weight: {user.currentWeight} lbs</li>
              <li>Body Fat: {user.estimatedBodyFat} %</li>
              <li>Experience: {user.trainingExperience}</li>
              <li>Goal: {user.mainPhysiqueGoal}</li>
              <li>Program Start Date: {convertedStartDate(parseInt(user.startDate))}</li>
              <li>Program Length: {user.weeks} weeks</li>
            </ul>
            <h5 className="card-title">Schedules:</h5>

            <ul>
              {user.schedule ? (

                <li key={user.schedule._id}>
                  <div className="card mt-2">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Schedule: {user.schedule.name}</h6>
                      <ul>

                        {user.schedule.workouts.map((workout, index) => {
                          const relevantWorkoutDetail = workoutDetails.find(
                            (detail) => detail.workout._id === workout.workoutId
                          );
                          return (
                            <li key={workout.workoutId + index}>
                              {workout.day}: 
                              {relevantWorkoutDetail && (
                                <ul>
                                  <li>Workout: {relevantWorkoutDetail.workout.name}</li>
                                  <li>Notes: {relevantWorkoutDetail.workout.notes}</li>
                                  <li>
                                    Exercises:
                                    <ul>
                                      {relevantWorkoutDetail.workout.exercises.map((exercise, index) => (
                                        <li key={index}>{index +1}. {exercise.name}</li>
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
              ) : (
                <li>No Schedule Assigned</li>
              )}
            </ul>
          </div>
        </div>
      )}
      {activeTab === 'view nutrition' && (
        <div>
          <h2>Daily Tracking</h2>
      <button onClick={() => setCurrentStartWeek(Math.max(1, currentStartWeek - 4))}>Previous 4 Weeks</button>
      <button onClick={() => setCurrentStartWeek(currentStartWeek + 4)}>Next 4 Weeks</button>
      <Link to={`/admin/user/${user._id}/trends`}>
        <button>View Trends</button>
        </Link>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Metric</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(weeks).slice(currentStartWeek - 1, currentStartWeek + 3).map((weekNumber) => (
            <React.Fragment key={weekNumber}>
              {['Weight', 'Calories', 'Protein'].map((type, index) => (
                <tr key={type}>
                  {index === 0 && <td rowSpan="3">Week {weekNumber} ({calculateWeekStartDate(parseInt(dataUser.user.startDate), weekNumber)})</td>}
                  <td>{type}</td>
                  {Object.keys(weeks[weekNumber]).map((dateUnix) => (
                    <td key={dateUnix}>
                      <input
                        type="number"
                        value={
                          (typeof weeks[weekNumber][dateUnix]?.[getTypeKey(type)] !== 'undefined'
                            ? weeks[weekNumber][dateUnix]?.[getTypeKey(type)]
                            : null) !== null ? (weeks[weekNumber][dateUnix]?.[getTypeKey(type)] || "").toString() : ""
                        }
                       
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
        </div>
      )}
      {activeTab === 'edit' && (
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
            <label> Role:
              <select type="text"
                name="role"
                placeholder="Role"
                value={formData.role || ''}
                onChange={handleChange}>
                <option value='' disabled>Select One</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>

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
                placeholder="Physique Goal"
                value={formData.mainPhysiqueGoal || ''}
                onChange={handleChange}>
                <option value='' disabled>Select One</option>
                <option value='Burn Fat'>Burn Fat</option>
                <option value='Build Muscle'>Build Muscle</option>
                <option value='Recomp'>Recomp</option>

              </select>

            </label>
            <label> Schedule:
              <select name="schedule" placeholder="Physique Goal"
                value={formData.schedule || ''} onChange={handleChange}>
                <option value='' disabled>Select One</option>
                {dataSchedules?.schedules?.map((schedule) => (
                  <option key={schedule._id} value={schedule._id}>{schedule.name}</option>
                ))}
              </select>
            </label>
            <label> Start Date:
              <input
                type="text"
                name="startDate"
                placeholder="Start Date"
                value={formData.startDate || ''}
                onChange={handleChange}
              />
            </label>
            <label> Weeks:
              <input
                type="text"
                name="weeks"
                placeholder="Weeks"
                value={formData.weeks || ''}
                onChange={handleChange}
              />
            </label>
            <button type="submit">Update User</button>
          </form>
        </div>
      )}
      {activeTab === 'delete' && (
        <div>
          <h2>Are you sure you want to delete this user?</h2>
          <button onClick={handleDelete}>Yes, Delete</button>
        </div>

      )}
    </div>

  );
};

export default UniqueUser;
