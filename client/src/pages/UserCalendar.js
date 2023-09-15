import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Auth from '../utils/auth';
import { useQuery } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';

const localizer = momentLocalizer(moment);

const UserCalendar = () => {
  const [events, setEvents] = useState([]);
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });
  console.log(data)

  useEffect(() => {
    if (data) {
      // Transform the user's schedule data into a format suitable for the calendar
      const calendarEvents = data.userSchedule.map((scheduleItem) => ({
        start: new Date(scheduleItem.start),
        end: new Date(scheduleItem.end),
        title: scheduleItem.title,
      }));
      setEvents(calendarEvents);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
