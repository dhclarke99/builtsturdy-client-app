import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { QUERY_USER_by_id, FETCH_WORKOUT_BY_ID } from '../utils/queries';
import { useApolloClient } from '@apollo/client';

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
        const workoutIds = userData.user.schedule.workouts.map(w => w.workoutId);

        const workouts = await Promise.all(workoutIds.map(async id => {
          const { data } = await client.query({
            query: FETCH_WORKOUT_BY_ID,
            variables: { workoutId: id },
          });
          return data.workout;
        }));

        const calendarEvents = workouts.map((workout, index) => {
          const date = moment().day(userData.user.schedule.workouts[index].day);
          return {
            workoutId: workout,
            id: index,
            title: workout.name, // Replace with actual workout name
            notes: workout.notes,
            start: date.toDate(),
            end: date.toDate(),
            allDay: true,
          };
        });
        setEvents(calendarEvents);
      }
    };

    fetchWorkouts();
  }, [userData, client]);

  console.log(events)

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    console.log(event)
    // Fetch more details about the clicked event here
    const { data } = await client.query({
      query: FETCH_WORKOUT_BY_ID,
      variables: { workoutId: event.workoutId._id }, // Assuming workoutId is stored in the title
    });
    setSelectedWorkout(data.workout);
  };

  if (userLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  return (
    <div>
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
              <ul>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <li key={index}>{exercise.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCalendar;
