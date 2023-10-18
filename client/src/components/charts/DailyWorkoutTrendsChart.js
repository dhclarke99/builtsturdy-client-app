import React from 'react';
import { Line } from 'react-chartjs-2';

const DailyWorkoutTrendsChart = ({ dailyWorkoutData }) => {
  // Prepare data for the charts
  const labels = dailyWorkoutData.map((day) => day.date);
  const exerciseData = dailyWorkoutData.map((day) => day.workout.length);

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
        <h2 className="chart-header">Daily Workout Trends</h2>
        <Line data={workoutConfig} options={options} />
      </div>
    </div>
  );
};

export default DailyWorkoutTrendsChart;
