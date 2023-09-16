import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Auth from '../utils/auth';
import { useQuery, useApolloClient } from '@apollo/client';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import placeholderImage from '../assets/images/placeholderImage.png';
import '../utils/userCalendar.css'
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

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (userData && userData.user && userData.user.schedule) {
        const startDate = moment(userData.user.startDate); // Make sure this is in the correct format
        const weeks = userData.user.weeks; // Number of weeks
        console.log("Start Date:", startDate);
        console.log("Weeks:", weeks);
  
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

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    const { data } = await client.query({
      query: FETCH_WORKOUT_BY_ID,
      variables: { workoutId: event.workoutId._id },
    });
    setSelectedWorkout(data.workout);
    console.log(data.workout)
  };

  if (userLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;
console.log(userData.user)
return (
  <div className="calendar-container">
    <h1 id="user-name">{userData.user.firstname}'s Calendar</h1>
    <div id="calendar-box">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleEventClick}
        className="user-calendar"
      />
    </div>
    {selectedEvent && (
      <div className="workout-details">
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
          <div className="exercise-list">
            <h3>Exercises:</h3>
            <ol>
              {selectedWorkout.exercises.map((exercise, index) => (
                <div key={exercise._id} className="exercise-item">
                  <h2 className="exercise-name">{index + 1}. {exercise.name}</h2>
                  <p className="exercise-info">Sets: {exercise.sets}, Reps: {exercise.reps}</p>
                  <p className="exercise-notes">Notes: {exercise.notes}</p>
                  <img 
                    src={placeholderImage} 
                    width="250"
                    alt="Walkthrough Video" 
                    className="exercise-video-placeholder"
                    onClick={() => setCurrentVideoUrl(exercise.videoUrl)}
                  />
                </div>
              ))}
            </ol>
          </div>
        )}
      </div>
    )}
  </div>
);

};

export default UserCalendar;

