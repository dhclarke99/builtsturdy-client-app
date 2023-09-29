import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Auth from '../utils/auth';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import {UPDATE_USER_COMPLETION} from '../utils/mutations'
import placeholderImage from '../assets/images/placeholderImage.png';
import '../utils/userCalendar.css';
import ProgressBar from 'react-bootstrap/ProgressBar'; 



const localizer = momentLocalizer(moment);

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
  const [completedDays, setCompletedDays] = useState([]);
  const [updateUserCompletion] = useMutation(UPDATE_USER_COMPLETION);
  
  

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (userData && userData.user && userData.user.schedule) {
        const roughDate = new Date(parseInt(userData.user.startDate))
        const startDate = moment(roughDate); // Make sure this is in the correct format
        const weeks = userData.user.weeks; // Number of weeks
        console.log("Start Date:", startDate);
        console.log("Weeks:", weeks);
        setCompletedDays(userData.user.completedDays)
  
        const workoutIds = userData.user.schedule.workouts.map(w => w.workoutId);
  
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
            const workoutDate = moment(startDate).add(i, 'weeks').day(userData.user.schedule.workouts[index].day);
            calendarEvents.push({
              workoutId: workout,
              id: index,
              title: workout.name,
              notes: workout.notes,
              start: workoutDate.toDate(),
              end: workoutDate.toDate(),
              allDay: true,
            });
          });
        }
  
        console.log("Calendar Events:", calendarEvents);
        setEvents(calendarEvents);
      }
    };

    fetchWorkouts();
  }, [userData, client]);

  console.log(events)

 
  


  const markDayAsCompleted = async () => {
    // Logic to mark a day as completed
    const selectedDate = new Date(selectedEvent.start);
    const selectedDateUnix = selectedDate.getTime();
  
    const dayToCompleteIndex = completedDays.findIndex(day => day.date === selectedDateUnix.toString());
  
    if (dayToCompleteIndex !== -1) {
      const dayToComplete = { ...completedDays[dayToCompleteIndex] };
      dayToComplete.completed = true;
  
      // Call your GraphQL mutation here to update completedDays in the database
      const { __typename, ...cleanedDayToComplete } = dayToComplete;
  
      // Make a GraphQL mutation call
      await updateUserCompletion({
        variables: { userId: Auth.getProfile().data._id, input: cleanedDayToComplete },
      });
  
      // Update the local state
      const updatedCompletedDays = [...completedDays];
      updatedCompletedDays[dayToCompleteIndex] = cleanedDayToComplete;
      setCompletedDays(updatedCompletedDays);
    } else {
      console.log("Day not found in completedDays array");
    }
  };
  

  const eventStyleGetter = (event) => {
    const isCompleted = completedDays.some(day => day.date === event.start.toISOString());
    return {
      style: {
        backgroundColor: isCompleted ? 'grey' : 'blue',
      },
    };
  };
let completedPercentage;
  if (userData && userData.user) {
    completedPercentage = (completedDays.length / userData.user.weeks * 7) * 100;
  }
  

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    console.log(selectedEvent)
    const { data } = await client.query({
      query: FETCH_WORKOUT_BY_ID,
      variables: { workoutId: event.workoutId._id },
    });
    setSelectedWorkout(data.workout);
    console.log(data.workout)
    workoutRef.current.scrollIntoView({behavior: 'smooth'});
  };

  const handleImageClick = async (videoUrl) => {
    await setCurrentVideoUrl(null);
    setCurrentVideoUrl(videoUrl);
    videoRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the video section
  };
  
  

  if (userLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;
console.log(userData.user)
return (
  <div className="calendar-container">
    <h1 id="user-name">{userData.user.firstname}'s Calendar</h1>
      <ProgressBar now={completedPercentage} label={`${completedPercentage}% Completed`} />
      <div id="calendar-box">
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
      
    {selectedEvent && (
      <div ref={videoRef} className="workout-details">
        <h2 className="workout-title">Workout Details for {selectedEvent.title}</h2>
        {currentVideoUrl && (
          <div className="video-section">
            <h3>Walkthrough Video:</h3>
            <video controls width="250">
              <source src={currentVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button className="close-video-btn" onClick={() => setCurrentVideoUrl(null)}>Close Video</button>
          </div>
        )}
        {selectedWorkout && (
          <div ref={workoutRef} className="exercise-list">
            <h3>Exercises:</h3>
            <ol>
              {selectedWorkout.exercises.map((exercise, index) => (
                <div key={exercise._id} className="exercise-item">
                  <h2 className="exercise-name">{index + 1}. {exercise.name}</h2>
                  <p className="exercise-info">Sets: {exercise.sets}, Reps: {exercise.reps}</p>
                  <p className="exercise-notes">Notes: {exercise.notes}</p>
                  <div className="exercise-video-container">
                    <img 
                    src={placeholderImage} 
                    width="250"
                    alt="Walkthrough Video" 
                    className="exercise-video-placeholder"
                    onClick={() => handleImageClick(exercise.videoUrl)}
                  />
                  </div>
              
                </div>
              ))}
            </ol>
          </div>
        )}
        {selectedEvent && (
  <button onClick={markDayAsCompleted}>Mark Workout Complete</button>
)}
      </div>
    )}
  </div>
);

};

export default UserCalendar;

