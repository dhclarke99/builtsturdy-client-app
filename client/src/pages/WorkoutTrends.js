import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth';
import WeeklyWorkoutTrendsChart from '../components/charts/WeeklyWorkoutTrendsChart';
import '../utils/css/Trends.css';

const WorkoutTrends = () => {
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });

  const weeklyExerciseProgress = {}; // Initialize an object to store weekly exercise progress

  if (data && data.user && data.user.completedDays) {
    // Loop through the completed days data
    data.user.completedDays.forEach((day) => {
      // Format the date as a string
      const weekStartDate = getWeekStartDate(new Date(parseInt(day.date))).toISOString();
      const dayOfWeek = getDayOfWeek(new Date(parseInt(day.date)));
      const exerciseData = {};

      // Loop through each workout in the completed day
      day.workout.forEach((workout) => {
        const exerciseName = workout.exerciseName;

        // If the exerciseName doesn't exist in exerciseData, initialize it
        if (!exerciseData[exerciseName]) {
          exerciseData[exerciseName] = {
            reps: [],
            weight: [],
          };
        }

        // Push the reps and weight data into the respective arrays
        exerciseData[exerciseName].reps.push(
          workout.sets.reduce((totalReps, set) => totalReps + set.actualReps, 0)
        );
        exerciseData[exerciseName].weight.push(
          workout.sets.reduce((totalWeight, set) => totalWeight + set.weight, 0)
        );
      });

      // Store exerciseData in weeklyExerciseProgress for the specific week and day of the week
      if (!weeklyExerciseProgress[weekStartDate]) {
        weeklyExerciseProgress[weekStartDate] = {};
      }

      weeklyExerciseProgress[weekStartDate][dayOfWeek] = exerciseData;
    });
  }

  console.log(weeklyExerciseProgress);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1 className='trends-header'>{data.user.firstname}'s Workout Trends</h1>
      <WeeklyWorkoutTrendsChart weeklyExerciseProgress={weeklyExerciseProgress} />
    </div>
  );
};

// Helper function to get the start date of the week
function getWeekStartDate(date) {
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  const daysUntilStartOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(date.getDate() - daysUntilStartOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

// Helper function to get the day of the week (Monday, Tuesday, etc.)
function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export default WorkoutTrends;
