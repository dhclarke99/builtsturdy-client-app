import React from 'react';
import { Line } from 'react-chartjs-2';

const WeeklyWorkoutTrendsChart = ({ weeklyExerciseProgress }) => {
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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
                  const exerciseLines = Object.keys(exerciseData).map((exerciseName) => {
                    const dataPoints = exerciseData[exerciseName];
                    return dataPoints.reps[0] * dataPoints.weight[0];
                  });

                  return {
                    label: `${exerciseData.name}`, // Corrected to use exerciseName
                    data: exerciseLines,
                    borderColor: getRandomColor(),
                    fill: false,
                  };
                }),
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
