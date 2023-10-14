import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { FETCH_ALL_WORKOUTS, FETCH_ALL_USERS, QUERY_EXERCISES, FETCH_SCHEDULES, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import { DELETE_WORKOUT, DELETE_EXERCISE, DELETE_SCHEDULE } from '../utils/mutations';
import { Link } from 'react-router-dom';
import '../utils/css/AdminDashboard.css'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { loading: loadingWorkouts, error: errorWorkouts, data: dataWorkouts } = useQuery(FETCH_ALL_WORKOUTS);
  const { loading: loadingUsers, error: errorUsers, data: dataUsers } = useQuery(FETCH_ALL_USERS);
  const { loading: loadingExercises, error: errorExercises, data: dataExercises } = useQuery(QUERY_EXERCISES);
  const { loading: loadingSchedules, error: errorSchedules, data: dataSchedules } = useQuery(FETCH_SCHEDULES);
  const [deleteWorkout] = useMutation(DELETE_WORKOUT, {
    refetchQueries: [{ query: FETCH_ALL_WORKOUTS }],
  });
  const [deleteSchedule] = useMutation(DELETE_SCHEDULE, {
    refetchQueries: [{ query: FETCH_SCHEDULES }],
  });
  const [deleteExercise] = useMutation(DELETE_EXERCISE, {
    refetchQueries: [{ query: QUERY_EXERCISES }],
  });
  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql' }),
    cache: new InMemoryCache(),
  });
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [sortedSchedules, setSortedSchedules] = useState([]);

  const [userSearch, setUserSearch] = useState('');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [workoutSearch, setWorkoutSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');

  const sortWorkoutsByDay = (workouts) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    // Create a copy of the array before sorting
    const workoutsCopy = [...workouts];
    return workoutsCopy.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));
  };

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

  useEffect(() => {
    if (dataSchedules) {
      const sorted = dataSchedules.schedules.map(schedule => {
        return {
          ...schedule,
          workouts: sortWorkoutsByDay(schedule.workouts)
        };
      });
      setSortedSchedules(sorted);
    }
  }, [dataSchedules]);

  const handleDeleteWorkout = async (workoutId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this workout?");
    if (isConfirmed) {
      try {
        await deleteWorkout({ variables: { workoutId } });
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  const handleDeleteSchedule = async (scheduleId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this schedule?");
    if (isConfirmed) {
      try {
        await deleteSchedule({ variables: { scheduleId } });
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  const handleDeleteExercise = async (exerciseId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this exercise?");
    if (isConfirmed) {
      try {
        await deleteExercise({ variables: { exerciseId } });
        window.location.href = "/admin/admindashboard";
      } catch (err) {
        console.error(err);
      }
    }
  };
  

  console.log(dataSchedules)
  console.log(dataUsers)
  console.log(dataWorkouts)
  if (loadingWorkouts || loadingUsers || loadingExercises || loadingSchedules) return <p>Loading...</p>;
  if (errorWorkouts || errorUsers || errorExercises || errorSchedules) return <p>Error: {errorWorkouts?.message || errorUsers?.message || errorExercises?.message || errorSchedules?.message}</p>;

  return (
    <div className='admin-dashboard'>
      <header>
      <h1>Admin Dashboard</h1>
      <nav className='admin-nav'>
        <ul className='admin-ul'>
          <button  onClick={() => setActiveTab('users')}>Users</button>
          <button onClick={() => setActiveTab('schedules')}>Schedules</button>
          <button onClick={() => setActiveTab('workouts')}>Workouts</button>
          <button  onClick={() => setActiveTab('exercises')}>Exercises</button>

        </ul>
      </nav>
      </header>
     

      {activeTab === 'schedules' && (
        <div>
          <h2>All Schedules</h2>
          <div className='search-section'>
          <input type="text" placeholder="Search Schedules" value={scheduleSearch} onChange={(e) => setScheduleSearch(e.target.value)} />
          <button>
            <Link to={`/admin/create-schedule`}>
              Create New Schedule
              </Link>
              </button>
          </div>
          <div className="row">
            {sortedSchedules.filter(schedule => schedule.name.toLowerCase().includes(scheduleSearch.toLowerCase())).map((schedule, index) => (
              <div className="col-md-6" key={schedule._id + index}>
                <div className="card mb-4">
                  <div className="card-header">
                    {schedule.name}: {schedule.notes}
                  </div>
                  
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {schedule.workouts.map((workout, index) => {
                        const relevantWorkoutDetail = workoutDetails.find(
                          (detail) => detail && detail.workout && detail.workout._id === workout.workoutId
                        );
                        return (
                          <li className="list-group-item" key={workout.workoutId + index}>
                            <strong>Day:</strong> {workout.day}, <strong>Workout ID:</strong> {workout.workoutId}
                            {relevantWorkoutDetail && (
                              <ul className="list-group list-group-flush mt-2">
                                <li className="list-group-item">Name: {relevantWorkoutDetail.workout.name}</li>
                                <li className="list-group-item">Notes: {relevantWorkoutDetail.workout.notes}</li>
                                <li className="list-group-item">
                                  Exercises:
                                  <ol className="list-group list-group-flush mt-2">
                                    {relevantWorkoutDetail.workout.exercises.map((exercise, index) => (
                                      <li className="list-group-item" key={index}>
                                        {exercise.exercise ? `${exercise.exercise.name}: ${exercise.sets} sets of ${exercise.targetReps} reps` : 'Exercise data missing'}
                                      </li>
                                    ))}
                                  </ol>
                                </li>
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className='card-footer'>
                  <button className='delete-btn'
                  onClick={() => handleDeleteSchedule(schedule._id)}>Delete</button>
                  <button className='edit-btn' onClick={() => window.location.href = `/admin/edit-schedule/${schedule._id}`}>Edit</button>
                </div>
                </div>
                
              </div>
            ))}
          </div>
       
        </div>
      )}

      {activeTab === 'workouts' && (
        <div>
          <h2>All Workouts</h2>
          <div className='search-section'>
          <input type="text" placeholder="Search Workouts" value={workoutSearch} onChange={(e) => setWorkoutSearch(e.target.value)} />
          <button>
            <Link to={`/admin/create-workout`}>
              Create New Workout
              </Link>
              </button>
          </div>
          {/* Your Workouts code here */}
          <div className='row'>
            {dataWorkouts.workouts.filter(workout => workout.name.toLowerCase().includes(workoutSearch.toLowerCase())).map((workout) => (
              <div className="col-md-3" key={workout._id}>
                <div className="card mb-3">
                  <div className='card-header'>
                    <h4 className="card-title">{workout.name}</h4>
                    <p className="card-text">User Notes: {workout.notes}</p>
                    <p className="card-text"> Admin Notes: {workout.adminNotes}</p>
                  </div>
                  <div className="card-body">

                    <ol>
                      {workout.exercises ? workout.exercises.map((exercise, index) => (
                        exercise.exercise ? (
                          <li key={exercise.exercise._id}>
                            {exercise.exercise.name}
                          </li>
                        ) : (
                          <li key={index}>Exercise data missing</li>
                        )
                      )) : <li>No Exercises assigned</li>}
                    </ol>

                    <div className='card-footer'>
                    <button className='delete-btn' onClick={() => handleDeleteWorkout(workout._id)}>Delete</button>
                    <button className='edit-btn' onClick={() => window.location.href = `/admin/edit-workout/${workout._id}`}>Edit</button>
                  </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2>All Users</h2>
          <div className='search-section'>
          <input type="text" placeholder="Search Users" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          <button>
            <Link to={`/admin/create-user`}>
              Create New User
              </Link>
              </button>
          </div>
          <div className="row">
            {/* Filter by name search */}
            {dataUsers.users.filter(user => user.firstname.toLowerCase().includes(userSearch.toLowerCase()) || user.lastname.toLowerCase().includes(userSearch.toLowerCase())).map((user) => (
              // Display Each User
              <div className="col-md-3" key={user._id}>
                <Link to={`/admin/user/${user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card mb-3">
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
          
          <div className='search-section'>
          <input type="text" placeholder="Search Exercises" value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} />
            <button>
            <Link to={`/admin/create-exercise`}>
              Create New exercise
              </Link>
              </button>
          </div>
          <div className="row">
            {dataExercises.exercises.filter(exercise => exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())).map((exercise) => (
              <div className="col-md-3" key={exercise._id}>
                <div className="card mb-3">
                  <div className="card-header">
                    <h5 className="card-title">{exercise.name}</h5>
                    <p className="card-subtitle">Notes: {exercise.notes}</p>
                    <p className="card-subtitle mb-2 text-muted">Admin Notes: {exercise.adminNotes}</p>
                  </div>
                  <div className="card-body">

                    <p>Video: {exercise.videoUrl} </p>
                    <p>Tag: {exercise.tag}</p>

                    

                  </div>
                  <div className='card-footer'>
                  <button className='delete-btn' onClick={() => handleDeleteExercise(exercise._id)}>Delete</button>
                    <button className='edit-btn' onClick={() => window.location.href = `/admin/edit-exercise/${exercise._id}`}>Edit</button>
                  </div>

                </div>
              </div>
            ))}
          </div>
          

          

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
