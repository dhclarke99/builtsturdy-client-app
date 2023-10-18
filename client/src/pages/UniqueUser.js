import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID, FETCH_SCHEDULES } from '../utils/queries';
import { UPDATE_USER, DELETE_USER } from '../utils/mutations';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../utils/css/UserCalendar.css';
import '../utils/css/UniqueUser.css';



const UniqueUser = () => {
  const [activeTab, setActiveTab] = useState('view info')
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const { loading: loadingSchedules, error: errorSchedules, data: dataSchedules } = useQuery(FETCH_SCHEDULES);
  const [events, setEvents] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const url = 'https://production.suggestic.com/graphql';


  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
  });

  const { id } = useParams();
  const [sortedWorkouts, setSortedWorkouts] = useState([]);


  const { loading: loadingUser, error: errorUser, data: dataUser } = useQuery(QUERY_USER_by_id, {
    variables: { userId: id.toString() },
    fetchPolicy: 'network-only'
  });

  const [formData, setFormData] = useState({});
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [currentStartWeek, setCurrentStartWeek] = useState(1);
  const localizer = momentLocalizer(moment);
  const existingMealTemplateQuery = `
  query {
    mealPlanTemplates {
      edges {
        node {
          id
          description
          createdAt
          coachId
          isPublic
          name
          days {
            day
            meals {
              recipe {
                name
                instructions
              }
              calories
              numOfServings
            }
          }
        }
      }
    }
  }`

 

  useEffect(() => {
    if (dataUser && dataUser.user) {
      const startDateString = new Date(parseInt(dataUser.user.startDate))
      const formattedStartDateString = `${startDateString.getMonth() + 1}/${startDateString.getDate()}/${startDateString.getFullYear()}`;
      const { schedule, startDate, ...restOfUserData } = dataUser.user;
      console.log(restOfUserData)
      const formattedUser = {
        ...restOfUserData,
        schedule: schedule ? schedule._id : null, // set only the ID
        startDate: formattedStartDateString 
      };
      console.log(formattedUser)
      setFormData(prevState => ({ ...prevState, ...formattedUser }));
      console.log("FormData has been set: ", formData)
    }
  }, [dataUser]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (dataUser && dataUser.user && dataUser.user.schedule) {
        const roughDate = new Date(parseInt(dataUser.user.startDate))
        const startDate = moment(roughDate); // Make sure this is in the correct format
        const weeks = dataUser.user.weeks; // Number of weeks
        console.log("Start Date:", startDate);
        console.log("Weeks:", weeks);
        setCompletedDays(dataUser.user.completedDays)
  
        const workoutIds = dataUser.user.schedule.workouts.map(w => w.workoutId);
  
        const workouts = await Promise.all(workoutIds.map(async id => {
          const { data } = await client.query({
            query: FETCH_WORKOUT_BY_ID,
            variables: { workoutId: id },
          });
          return data.workout;
        }));
  
        const calendarEvents = [];
  
        for (let i = 0; i < weeks; i++) {
          workouts.forEach((workout, index) => {
            let workoutDate = moment(startDate).add(i, 'weeks').day(dataUser.user.schedule.workouts[index].day);
        
            // Only add the workout to the calendar if it's on or after the startDate
            if (workoutDate.isSameOrAfter(startDate, 'day')) {
              calendarEvents.push({
                workoutId: workout,
                id: index,
                title: workout?.name,
                notes: workout?.notes,
                start: workoutDate.toDate(),
                end: workoutDate.toDate(),
                allDay: true,
              });
            }
          });
        }
        
  
        console.log("Calendar Events:", calendarEvents);
        setEvents(calendarEvents);
      }
    };

    fetchWorkouts();
  }, [dataUser, client]);

  useEffect(() => {
    if (dataUser && dataUser.user && dataUser.user.schedule && dataUser.user.schedule.workouts) {
      console.log("dataUser", dataUser.user.schedule.workouts);

      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

      const newSortedWorkouts = [...dataUser.user.schedule.workouts].sort((a, b) => {
        return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      });

      setSortedWorkouts(newSortedWorkouts);
    }
  }, [dataUser]);

  const createNewMealPlanTemplate = async (formattedData) => {
    try {
      console.log("template being created...");
      console.log(formattedData);
  
      const proteinPerc = Math.round(((formattedData.proteinTarget * 4) / formattedData.caloricTarget) * 100);
      const carbsPerc = Math.round(((formattedData.carbohydrateTarget * 4) / formattedData.caloricTarget) * 100);
      const fatPerc = Math.round(((formattedData.fatTarget * 9) / formattedData.caloricTarget) * 100);
      const firstname = formattedData.firstname;
      const lastname = formattedData.lastname;
      const description = formattedData.mainPhysiqueGoal;
  
      const createTemplateMutation = `
        mutation {
          createMealPlanTemplate(
            description: "${firstname}'s ${description} meal plan template at ${formattedData.currentWeight} and ${formattedData.caloricTarget} calories",
            customOptions: {
              calories: ${formattedData.caloricTarget},
              carbsPerc: ${carbsPerc},
              proteinPerc: ${proteinPerc},
              fatPerc: ${fatPerc},
              program: "UHJvZ3JhbTo2ZmI3ZDFlMy1lODYwLTRmNjItODAzOS0zYWRkZWM2YWU4MDE="
            },
            name: "${firstname} ${lastname}'s Meal Plan Template"
          ) {
            message,
            success
          }
        }
      `;
  
      const response = await fetch('/api/suggesticMutation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          
        },
        body: JSON.stringify({ query: createTemplateMutation })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create meal plan template');
      }
  
      const data = await response.json();
      console.log(data);
  
      const templateResponse = await fetch('/api/suggesticMutation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
         
        },
        body: JSON.stringify({ query: existingMealTemplateQuery })
      });
  
      if (!templateResponse.ok) {
        throw new Error('Failed to fetch existing meal plan templates');
      }
  
      const templateData = await templateResponse.json();
      console.log(templateData);
  
      const checkDescription = `${firstname}'s ${description} meal plan template at ${formattedData.currentWeight} and ${formattedData.caloricTarget} calories`;
      const trimmedDescription = checkDescription.trim();
  
      const idToGenerate = templateData.data.mealPlanTemplates.edges.findIndex(plan => plan.node.description.trim() === trimmedDescription);
      const matchingTemplateId = templateData.data.mealPlanTemplates.edges[idToGenerate].node.id;
  
      console.log(matchingTemplateId);
  
      return matchingTemplateId;
  
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
 
  const handleChange = (event) => {
    const { name, value } = event.target;
    let updatedFormData = {
      ...formData,
      [name]: value,
    };
  
    if (name === 'proteinTarget') {
      const newProteinTarget = parseFloat(value);
      const { caloricTarget } = formData;
  
      // Calculate the protein calories
      const proteinCalories = newProteinTarget * 4;
  
      // Calculate the remaining calories for carbs and fats
      const remainingCalories = caloricTarget - proteinCalories;
  
      // Distribute the remaining calories between carbs and fats
      // Add 5% to carbs and subtract 5% from fats
      const carbCalories = remainingCalories * 0.55; // 50% + 5%
      const fatCalories = remainingCalories * 0.45; // 50% - 5%
  
      // Convert the calories back to grams
      const newCarbohydrateTarget = carbCalories / 4;
      const newFatTarget = fatCalories / 9;
  
      updatedFormData = {
        ...updatedFormData,
        carbohydrateTarget: newCarbohydrateTarget.toFixed(2),
        fatTarget: newFatTarget.toFixed(2),
      };
    }
  
    if (name === 'startDate') {
      setFormData({
        ...updatedFormData,
        [name]: value,
      });
    } else {
      setFormData(updatedFormData);
    }
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
    console.log(formData)
    event.preventDefault();
    try {

      const cleanedDailyTracking = formData.dailyTracking.map(({ __typename, ...rest }) => rest);
      const { __typename, _id, completedDays, emailVerificationToken, ...cleanedFormData } = {...formData, dailyTracking: cleanedDailyTracking}; // Remove __typename
  
      console.log(cleanedFormData)
      const formattedData = {
        ...cleanedFormData,
        height: parseFloat(cleanedFormData.height),
        currentWeight: parseFloat(cleanedFormData.currentWeight),
        estimatedBodyFat: parseFloat(cleanedFormData.estimatedBodyFat),
        caloricTarget: parseFloat(cleanedFormData.caloricTarget),
        proteinTarget: parseFloat(cleanedFormData.proteinTarget),
        carbohydrateTarget: parseFloat(cleanedFormData.carbohydrateTarget),
        fatTarget: parseFloat(cleanedFormData.fatTarget),
        age: parseInt(cleanedFormData.age, 10),
        weeks: parseFloat(cleanedFormData.weeks),
        startDate: stringToUnix(formData.startDate).toString(),
      };
      console.log(formData.startDate)
      console.log(stringToUnix(formData.startDate).toString())
      console.log(formattedData)
       // Check if the macronutrient targets add up to 100% of the caloric target
    const { caloricTarget, proteinTarget, carbohydrateTarget, fatTarget } = formattedData;
    const proteinPercentage = (proteinTarget * 4) / caloricTarget;
    const carbPercentage = (carbohydrateTarget * 4) / caloricTarget;
    const fatPercentage = (fatTarget * 9) / caloricTarget;
    const totalPercentage = (proteinPercentage + carbPercentage + fatPercentage) * 100;

    if (Math.round(totalPercentage) !== 100) {
      alert(`The sum of the macronutrient percentages is ${Math.round(totalPercentage)}, not 100.`)
      throw new Error(`The sum of the macronutrient percentages is ${Math.round(totalPercentage)}, not 100.`);
    }

    // Check if any of the specific fields have changed
    const fieldsToCheck = ['caloricTarget', 'proteinTarget', 'carbohydrateTarget', 'fatTarget'];
    let shouldUpdateMealPlan = false;

    for (const field of fieldsToCheck) {
      if (formattedData[field] !== dataUser.user[field]) {
        shouldUpdateMealPlan = true;
        break;
      }
    }

    // If any of the specific fields have changed, create a new meal plan template
    if (shouldUpdateMealPlan) {
      const newMealPlanTemplateID = await createNewMealPlanTemplate(formattedData);
      formattedData.mealPlanTemplate = newMealPlanTemplateID;
      console.log("New Meal Plan ID: ", newMealPlanTemplateID)
    }

    await updateUser({
      variables: { userId: id, input: formattedData },
    });
    console.log(formattedData)
      console.log("data User: ", dataUser)
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

  const eventStyleGetter = (event) => {
    const selectedDateUnix = event.start.getTime().toString();
    const dayToComplete = completedDays.find((day) => day.date === selectedDateUnix);
  
    // Check if the day is completed and apply different styling
    if (dayToComplete && dayToComplete.completed) {
      return {
        className: 'completed-event', // Apply the completed-event class for completed days
      };
    }
  
    return {}; // Return an empty object for default styling (blue)
  };

  if (loadingUser || loadingSchedules) return <p>Loading...</p>;
  if (errorUser || errorSchedules) return <p>Hold On One Second</p>;

  const user = dataUser.user;
  const unixToString = (startDate) => {
  
    const convertedStartDate = new Date(parseInt(startDate))
    return `${convertedStartDate.getMonth() + 1}/${convertedStartDate.getDate()}/${convertedStartDate.getFullYear()}`;

  };

  const stringToUnix = (str) => {
    
    const [month, day, year] = str.split('/');
    console.log(new Date(`${month}/${day}/${year}`).getTime())
    return new Date(`${month}/${day}/${year}`).getTime();
  };
 

  console.log(formData)
  return (

    <div className="container mt-5">
      <nav>
        <ul>
          <button onClick={() => setActiveTab('view info')}>View Info</button>
          <button onClick={() => setActiveTab('view nutrition')}>View Nutrition</button>
          <button onClick={() => setActiveTab('view progress')}>View Progress</button>
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
              <li>Caloric Target: {user.caloricTarget} calories</li>
              <li>Protein Target: {user.proteinTarget} grams</li>
              <li>Carbs Target: {user.carbohydrateTarget} grams</li>
              <li>Fats Target: {user.fatTarget} grams</li>
              <li>Program Start Date: {unixToString(parseInt(user.startDate))}</li>
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

                        {sortedWorkouts.map((workout, index) => {
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
                                        <li key={index}>{index +1}. {exercise.exercise.name}</li>
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
            <th className='table-header'>Week</th>
            <th className='table-header'>Metric</th>
            <th className='table-header'>Monday</th>
            <th className='table-header'>Tuesday</th>
            <th className='table-header'>Wednesday</th>
            <th className='table-header'>Thursday</th>
            <th className='table-header'>Friday</th>
            <th className='table-header'>Saturday</th>
            <th className='table-header'>Sunday</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(weeks).slice(currentStartWeek - 1, currentStartWeek + 3).map((weekNumber) => (
            <React.Fragment key={weekNumber}>
              {['Weight', 'Calories', 'Protein'].map((type, index) => (
                <tr key={type}>
                  {index === 0 && <td className='table-header' rowSpan="3">Week {weekNumber} ({calculateWeekStartDate(parseInt(dataUser.user.startDate), weekNumber)})</td>}
                  <td className='table-header'>{type}</td>
                  {Object.keys(weeks[weekNumber]).map((dateUnix) => (
                    <td key={dateUnix}>
                      <input
                        type="number"
                        readOnly
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
      {activeTab === 'view progress' && (
        <div className="calendar-container">
          <h2>User Progress</h2>
          <div id="calendar-box">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              className="user-calendar"
            />
          </div>
        </div>
      )}
      {activeTab === 'edit' && (
        <div className='form-container'>

          <h1 id='edit-user-title'>Edit User</h1>
          <form onSubmit={handleSubmit} id='edit-user-form'>
            {/* Add form fields here based on your schema. For example: */}
            <label className='form-label'> First Name:
              <input
              className='form-input'
                type="text"
                name="firstname"
                placeholder="First Name"
                value={formData.firstname || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Last Name:
              <input
              className='form-input'
                type="text"
                name="lastname"
                placeholder="Last Name"
                value={formData.lastname || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Username:
              <input
              className='form-input'
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Email:
              <input
              className='form-input'
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Role:
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
            <label className='form-label'> Age:
              <input
              className='form-input'
                type="text"
                name="age"
                placeholder="Age"
                value={formData.age || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Gender:
              <select type="text"
                name="gender"
                placeholder="Gender"
                value={formData.gender || ''}
                onChange={handleChange}>
                <option value="Male"> Male</option>
                <option value="Female"> Female</option>
              </select>

            </label>
            <label className='form-label'> Height (inches):
              <input
              className='form-input'
                type="text"
                name="height"
                placeholder="Height"
                value={formData.height || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Weight (lbs):
              <input
              className='form-input'
                type="text"
                name="currentWeight"
                placeholder="Current Weight"
                value={formData.currentWeight || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Body Fat (%):
              <input
              className='form-input'
                type="text"
                name="estimatedBodyFat"
                placeholder="Body Fat %"
                value={formData.estimatedBodyFat || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Training Experience:
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
            <label className='form-label'> Phsyique Goal:
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
            <label className='form-label'> Caloric Target:
              <input
              className='form-input'
                type="text"
                name="caloricTarget"
                placeholder="Caloric Target"
                value={formData.caloricTarget || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Protein Target:
              <input
              className='form-input'
                type="text"
                name="proteinTarget"
                placeholder="Protein Target"
                value={formData.proteinTarget || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Carbohydrate Target:
              <input
              className='form-input'
                type="text"
                name="carbohydrateTarget"
                placeholder="Carb Target"
                value={formData.carbohydrateTarget || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Fat Target:
              <input
              className='form-input'
                type="text"
                name="fatTarget"
                placeholder="Fat Target"
                value={formData.fatTarget || ''}
                onChange={handleChange}
              />
            </label>
            
            <label className='form-label'> Schedule:
              <select name="schedule" placeholder="Physique Goal"
                value={formData.schedule || ''} onChange={handleChange}>
                <option value='' disabled>Select One</option>
                {dataSchedules?.schedules?.map((schedule) => (
                  <option key={schedule._id} value={schedule._id}>{schedule.name}</option>
                ))}
              </select>
            </label>
            <label className='form-label'> Start Date:
              <input
              className='form-input'
                type="text"
                name="startDate"
                placeholder="Start Date"
                value={formData.startDate|| ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Weeks:
              <input
              className='form-input'
                type="text"
                name="weeks"
                placeholder="Weeks"
                value={formData.weeks || ''}
                onChange={handleChange}
              />
            </label>
            <label className='form-label'> Meal Plan Template:
              <input
              className='form-input'
                type="text"
                name="mealPlanTemplate"
                placeholder="Meal Plan Template"
                value={formData.mealPlanTemplate || ''}
                readOnly
              />
            </label>
            <button type="submit" id='update-button'>Update User</button>
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
