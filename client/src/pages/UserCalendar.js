import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Auth from '../utils/auth';
import { Link } from 'react-router-dom';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import { UPDATE_USER_COMPLETION, LOG_COMPLETED_WORKOUT } from '../utils/mutations'
import placeholderImage from '../assets/images/placeholderImage.png';
import '../utils/css/UserCalendar.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import LogWorkoutForm from '../utils/LogWorkoutForm';

const localizer = momentLocalizer(moment);
// Set Monday as the first day of the week
moment.updateLocale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
  }
});

const UserCalendar = () => {
 
  const [events, setEvents] = useState([]);
  const client = useApolloClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const { loading: userLoading, error: userError, data: userData } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });
  
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const workoutRef = useRef(null);
  const calendarRef = useRef(null);
  const [completedDays, setCompletedDays] = useState([]);
  const [scheduleType, setScheduleType] = useState(null);
  const [updateUserCompletion] = useMutation(UPDATE_USER_COMPLETION);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [logCompletedWorkout, { data, loading, error }] = useMutation(LOG_COMPLETED_WORKOUT);
  

  const handleTrackClick = (exercise) => {

    setSelectedExercise(exercise);
    if (showForm === false) {
      setShowForm(true);
    } else {
      setShowForm(false)
    }

  };

  const handleSubmit = async (userId, date, workoutData) => {
    try {
      const { data } = await logCompletedWorkout({
        variables: {
          userId,  // Make sure this is defined
          date: new Date(date).toISOString(),  // Make sure this is defined
          workouts: workoutData
        }
      });
     
      setShowForm(false);
    } catch (err) {
      console.error("An error occurred: ", err);
    }
  };

  const generateAlternatingEvents = async (workouts, startDate, weeks, userData, calendarEvents) => {
    console.log(workouts);
    const workoutDays = [];
    const restDays = [];
    console.log("startDate alternating: ", startDate);
  
    // Separate the workout days and rest days into two arrays
    workouts.forEach((workoutInfo) => {
      const { name } = workoutInfo;
      if (name.toLowerCase() === 'rest') {
        restDays.push(workoutInfo);
      } else {
        workoutDays.push(workoutInfo);
      }
    });
  
    console.log(workoutDays);
    console.log(restDays);
  
    // Iterate over the number of weeks
    for (let week = 0; week < weeks; week++) {
      // Flip the assignment of workout IDs for Monday and Friday every week
    // Flip the assignment of workout IDs for Monday and Friday every week
    let isEvenWeek = week % 2 === 0;
    let mondayFridayWorkout = isEvenWeek ? workoutDays[0] : workoutDays[1];
    let wednesdayWorkout = isEvenWeek ? workoutDays[1] : workoutDays[0];

    // Assign workouts to Monday, Wednesday, and Friday
    let workoutInfoMonday = {...mondayFridayWorkout, day: 'Monday'};
    let workoutInfoWednesday = {...wednesdayWorkout, day: 'Wednesday'};
    let workoutInfoFriday = {...mondayFridayWorkout, day: 'Friday'};

    // Schedule the workouts for Monday, Wednesday, and Friday
    [workoutInfoMonday, workoutInfoWednesday, workoutInfoFriday].forEach((workoutInfo) => {
      let workoutDate = moment(startDate).add(week, 'weeks').day(workoutInfo.day);
      if (moment(workoutDate).isValid()) {
        calendarEvents.push({
          workoutId: workoutInfo,
          id: `${workoutInfo.id}-${week}-${workoutInfo.day}`,
          title: workoutInfo.name,
          notes: workoutInfo.notes,
          start: workoutDate.toDate(),
          end: workoutDate.toDate(),
          allDay: true,
        });
      }
    });

  
      // Schedule rest days
      restDays.forEach((restInfo) => {
        let restDate = moment(startDate).add(week, 'weeks').day(restInfo.day);
        if (moment(restDate).isValid() && restDate.isAfter(startDate, 'day')) {
          calendarEvents.push({
            workoutId: restInfo,
            id: `rest-${week}-${restInfo.day}`,
            title: restInfo.name,
            notes: restInfo.notes,
            start: restDate.toDate(),
            end: restDate.toDate(),
            allDay: true,
          });
        }
      });
    }
  };
  
  

   
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (userData && userData.user && userData.user.schedule) {
        const type = userData.user.schedule.type;
        setScheduleType(type);
  
        const roughDate = new Date(parseInt(userData.user.startDate)).toUTCString();
console.log(roughDate)
        // Create a moment object with the provided UNIX timestamp and set it to UTC
        const startDate = moment(roughDate);
        // startDate.utc();
        console.log("Start Date: ", startDate)
     
        const weeks = userData.user.weeks; // Number of weeks
        setCompletedDays(userData.user.completedDays);
        const workoutIds = userData.user.schedule.workouts.map(w => ({
          workoutId: w.workoutId,
          day: w.day,
        }));
        const workouts = await Promise.all(workoutIds.map(async id => {
          const { data } = await client.query({
            query: FETCH_WORKOUT_BY_ID,
            variables: { workoutId: id.workoutId },
          });
          return { ...data.workout, day: id.day};
        }));
  
        let calendarEvents = [];

        if (type === 'Repeating') {
          // Use your existing logic for repeating schedules
          for (let i = 0; i < weeks; i++) {
            workouts.forEach((workout, index) => {
              let workoutDate = moment(roughDate).add(i, 'weeks').day(userData.user.schedule.workouts[index].day);
              // workoutDate = workoutDate.utc();
              // if (workoutDate.isBefore(startDate, 'day')) {
              //   return;
              // }
              // Only add the workout to the calendar if it's on or after the startDate
              if (workoutDate.isAfter(roughDate, 'day')) {
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
        } else if (type === 'Alternating') {     
           await generateAlternatingEvents(workouts, startDate, weeks, userData, calendarEvents); // Implement your logic or function here
            
        }
  
        setEvents(calendarEvents);
      }
    };
  
    fetchWorkouts();
  }, [userData, client]);
  

  const markDayAsCompleted = async () => {
    const selectedDate = new Date(selectedEvent.start);
    const selectedDateUnix = selectedDate.setUTCHours(0, 0, 0, 0); // Set time to midnight

    const dayToCompleteIndex = completedDays.findIndex((day) => {
      // Convert the date from completedDays to midnight as well
      const completedDate = new Date(parseInt(day.date));
      completedDate.setUTCHours(0, 0, 0, 0);

      return completedDate.getTime() === selectedDateUnix;
    });

    if (dayToCompleteIndex !== -1) {
      const { workout, ...dayToComplete } = { ...completedDays[dayToCompleteIndex] };
      dayToComplete.completed = !dayToComplete.completed; // Toggle the completion status

      const { __typename, ...cleanedDayToComplete } = dayToComplete;

      // Make a GraphQL mutation call
      await updateUserCompletion({
        variables: { userId: Auth.getProfile().data._id, input: cleanedDayToComplete },
      });

      // Update the local state
      const updatedCompletedDays = [...completedDays];
      updatedCompletedDays[dayToCompleteIndex] = cleanedDayToComplete;
      setCompletedDays(updatedCompletedDays);
      setIsWorkoutCompleted(dayToComplete.completed);


      // Scroll back to the calendar
      if (calendarRef.current) {
        calendarRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      console.log("Day not found in completedDays array");
    }
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

  let completedPercentage;
  if (completedDays.length > 0) {
    completedPercentage = Math.floor((completedDays.filter(day => day.completed).length / completedDays.length) * 100);
  }



  const handleEventClick = async (event) => {
    console.log(event)
    await setCurrentVideoUrl(null);
    setShowForm(false);
    setSelectedEvent(event);

    // Find the completion status of the clicked event in the completedDays array
    const selectedDateUnix = event.start.getTime().toString();
    const dayToComplete = completedDays.find((day) => day.date === selectedDateUnix);

    // Set the isWorkoutCompleted state based on the found day
    if (dayToComplete) {
      setIsWorkoutCompleted(dayToComplete.completed);
    } else {
      setIsWorkoutCompleted(false);
    }
    const { data } = await client.query({
      query: FETCH_WORKOUT_BY_ID,
      variables: { workoutId: event?.workoutId?._id },
    });
    setSelectedWorkout(data.workout);
    workoutRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  const handleImageClick = async (videoUrl) => {
    await setCurrentVideoUrl(null);
    setCurrentVideoUrl(videoUrl);
    videoRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the video section
  };

  console.log(userData)
  console.log(events)
  if (userLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;
 
  return (
    <div className='calendar-page'>
      <div className="calendar-container">
        <h1 id="user-name">{userData?.user?.firstname}'s Calendar</h1>
        <h2>Program Progress</h2>
        <ProgressBar now={completedPercentage} label={`${completedPercentage}%`} />
        {/* <div>
          <Link to={'/workout-trends'}>
            <button>View Trends
            </button>
          </Link>
        </div> */}

        <div id="calendar-box" ref={calendarRef}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventClick}
            onSelectSlot={markDayAsCompleted}
            eventPropGetter={eventStyleGetter}
            className="user-calendar"
          />
        </div>
      </div>

      {selectedEvent && (

        <div ref={videoRef} className="workout-details">
          <h2 className="workout-title">{selectedEvent.title} Workout</h2>
          {currentVideoUrl && (
            <div className="video-section">
              <h3>Walkthrough Video</h3>
              <video controls width="250">
                <source src={currentVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button className="close-video-btn" onClick={() => setCurrentVideoUrl(null)}>Close Video</button>
            </div>

          )}

          {selectedWorkout && (
            <div ref={workoutRef} className="exercise-list">

              <ol>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div key={exercise.exercise._id} className="exercise-item">
                    <h2 className="exercise-name">{index + 1}. {exercise.exercise.name}</h2>
                    <p className="exercise-info">Sets: {exercise.sets}, Reps: {exercise.targetReps}</p>
                    <p className="exercise-notes">Notes: {exercise.exercise.notes}</p>
                    <div className="exercise-video-container">
                      {exercise.exercise.videoUrl ? (
                        <img
                          src={placeholderImage}
                          width="250"
                          alt="Walkthrough Video"
                          className="exercise-video-placeholder"
                          onClick={() => handleImageClick(exercise.exercise.videoUrl)}
                        />
                      ) : (
                        <p>Video coming soon</p>
                      )}
                    </div>
                    <button className='track-button' onClick={() => handleTrackClick(exercise)}>Track</button>
                    {showForm && selectedExercise.exercise._id === exercise.exercise._id && (
                      <LogWorkoutForm
                        exercise={selectedExercise}
                        onSubmit={handleSubmit}
                        date={selectedEvent}
                        userData={userData.user}
                      />
                    )}
                  </div>
                ))}
              </ol>

            </div>
          )}
          {selectedEvent && (
            <button onClick={markDayAsCompleted}>
              {selectedEvent && isWorkoutCompleted
                ? "Mark Workout Incomplete"
                : "Mark Workout Complete"
              }
            </button>

          )}
        </div>
      )}
    </div>
  );

};

export default UserCalendar;

