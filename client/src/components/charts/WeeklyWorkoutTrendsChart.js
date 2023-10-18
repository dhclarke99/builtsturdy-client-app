import React from 'react';
import { Line } from 'react-chartjs-2';

const WeeklyWorkoutTrendsChart = ({ weeklyWorkoutData }) => {
  // Prepare data for the charts
  const labels = weeklyWorkoutData.map((week) => week.startDate);
  const exerciseData = weeklyWorkoutData.map((week) =>
    week.completedDays.reduce((totalExercises, day) => totalExercises + day.workout.length, 0)
  );

  // Chart configuration
  const workoutConfig = {
    labels,
    datasets: [
      {
        label: 'Workout Count',
        data: exerciseData,
        borderColor: 'purple',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        // Define your y-axis options here
      },
      x: {
        // Define your x-axis options here
      },
    },
    plugins: {
      legend: {
        // Define legend options here
      },
    },
  };

  return (
    <div>
      <div className="chart">
        <h2 className="chart-header">Weekly Workout Trends</h2>
        <Line data={workoutConfig} options={options} />
      </div>
    </div>
  );
};

export default WeeklyWorkoutTrendsChart;
