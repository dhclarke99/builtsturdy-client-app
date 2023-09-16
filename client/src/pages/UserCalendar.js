import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Auth from '../utils/auth';
import { useQuery, useApolloClient } from '@apollo/client';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID } from '../utils/queries';

const localizer = momentLocalizer(moment);

const UserCalendar = () => {
  const [events, setEvents] = useState([]);
  const client = useApolloClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const { loading: userLoading, error: userError, data: userData } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });

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
    <div>
        <h1>{userData.user.firstname}'s Calendar</h1>
      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleEventClick}
        />
      </div>
      {selectedEvent && (
        <div>
          <h2>Workout Details for {selectedEvent.title}</h2>
          {selectedWorkout && (
            
            <div>
              <h3>Exercises:</h3>
              <ol>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div key={exercise._id}>
                  <h2>{index +1}. {exercise.name}</h2>
                  <p>Sets: {exercise.sets}, Reps: {exercise.reps}</p>
                  <p>Notes: {exercise.notes}</p>
                  <video controls width="250">
                    <source src={exercise.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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

