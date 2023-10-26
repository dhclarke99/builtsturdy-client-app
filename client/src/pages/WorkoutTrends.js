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

    // Initialize an object to store reorganized exercise progress data
    const reorganizedExerciseProgress = {};

    if (data && data.user && data.user.completedDays) {
        // Loop through the completed days data
        data.user.completedDays.forEach((day) => {
            // Format the date as a string
            const weekStartDate = getWeekStartDate(new Date(parseInt(day.date))).toISOString();
            const dayOfWeek = getDayOfWeek(new Date(parseInt(day.date)));

            // Check if the weekStartDate exists in reorganizedExerciseProgress, initialize it if not
            if (!reorganizedExerciseProgress[weekStartDate]) {
                reorganizedExerciseProgress[weekStartDate] = {};
            }

            // Check if the dayOfWeek exists for the current weekStartDate, initialize it if not
            if (!reorganizedExerciseProgress[weekStartDate][dayOfWeek]) {
                reorganizedExerciseProgress[weekStartDate][dayOfWeek] = [];
            }

            // Loop through each workout in the completed day
            day.workout.forEach((workout) => {
                const exerciseName = workout.exerciseName;

                // Push the exercise data for the specific day and exercise
                reorganizedExerciseProgress[weekStartDate][dayOfWeek].push({
                    exerciseName,
                    reps: workout.sets.reduce((total, set) => total + set.actualReps, 0),
                    weight: workout.sets.reduce((total, set) => total + set.weight, 0) / workout.sets.length,
                });
            });
        });
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1 className='trends-header'>{data.user.firstname}'s Workout Trends</h1>
            <WeeklyWorkoutTrendsChart weeklyExerciseProgress={reorganizedExerciseProgress} />
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
