import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth';
import WeeklyWorkoutTrendsChart from '../components/charts/WeeklyWorkoutTrendsChart';
import DailyWorkoutTrendsChart from '../components/charts/DailyWorkoutTrendsChart';
import '../utils/css/Trends.css';

const WorkoutTrends = () => {
  const [viewMode, setViewMode] = useState('weekly'); 
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });

  const weeklyWorkoutData = [];

  const handleViewModeChange = (event) => {
    setViewMode(event.target.value);
  };

  if (data && data.user && data.user.completedDays) {
    console.log("completed Days: ", data.user.completedDays)
    const sortedCompletedDays = [...data.user.completedDays].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedCompletedDays.forEach((day, index) => {
      const weekNumber = Math.floor(index / 7) + 1;
      if (!weeklyWorkoutData[weekNumber]) {
        weeklyWorkoutData[weekNumber] = {
          startDate: day.date, // Use the date of the first day in the week
          completedDays: [day],
        };
      } else {
        weeklyWorkoutData[weekNumber].completedDays.push(day);
      }
    });
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1 className='trends-header'>{data.user.firstname}'s Workout Trends</h1>
      <div className="toggle-view">
        <label htmlFor="viewMode">Select View: </label>
        <select id="viewMode" onChange={handleViewModeChange} value={viewMode}>
          <option value="weekly">Weekly Trends</option>
          <option value="daily">Daily Trends</option>
        </select>
      </div>
      {viewMode === 'weekly' && (
        <WeeklyWorkoutTrendsChart weeklyWorkoutData={weeklyWorkoutData} />
      )}
      {viewMode === 'daily' && (
        <DailyWorkoutTrendsChart dailyWorkoutData={data.user.completedDays} />
      )}
    </div>
  );
};

export default WorkoutTrends;
