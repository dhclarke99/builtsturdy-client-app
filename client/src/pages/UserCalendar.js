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
            id: index,
            title: workout.name, // Replace with actual workout name
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

  if (userLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;

  return (
    <div style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
};

export default UserCalendar;
