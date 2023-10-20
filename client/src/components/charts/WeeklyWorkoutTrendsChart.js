import React from 'react';
import { Line } from 'react-chartjs-2';
import '../../utils/css/Trends.css';

const WeeklyWorkoutTrendsChart = ({ weeklyExerciseProgress }) => {
  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Chart configuration
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        // Define your y-axis options here
      },
      x: {
        // Define your x-axis options here
        type: 'linear', // Use a linear x-axis
        ticks: {
          stepSize: 1,
          color: 'white', // difference between each tick
        },
        min: 0,
        max: 12,
        title: {
          display: true,
          text: 'Weeks',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        // Define legend options here
      },
    },
  };

  // Function to generate a random color for each exercise line
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div>
      {daysOfWeek.map((dayOfWeek, index) => (
        <div key={index} className="chart">
          <h2 className="chart-header">Workout Trends for {dayOfWeek}</h2>
          <div className="chart-container">
          <Line
  data={{
    labels: Object.keys(weeklyExerciseProgress).map((weekStartDate) => weekStartDate),
    datasets: Object.keys(weeklyExerciseProgress).map((weekStartDate) => {
      const exerciseData = weeklyExerciseProgress[weekStartDate][dayOfWeek];
      if (exerciseData && exerciseData.length > 0) {
        return {
          label: exerciseData.map((dataPoint) => dataPoint.exerciseName), // Use exercise names as labels
          data: exerciseData.map((dataPoint) => dataPoint.reps), // Use reps as data points
          borderColor: getRandomColor(),
          fill: false,
        };
      }
      return null;
    }).filter(Boolean),
  }}
  options={options}
/>

          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyWorkoutTrendsChart;
