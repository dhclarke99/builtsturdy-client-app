import React from 'react';
import { Line } from 'react-chartjs-2';

const TrendsChart = ({ weeklyAverages }) => {
  // Prepare data for the charts
  const labels = Object.keys(weeklyAverages);
  const avgWeightData = labels.map((week) => weeklyAverages[week].averageWeight);
  const avgCaloriesData = labels.map((week) => weeklyAverages[week].averageCalories);
  const avgProteinData = labels.map((week) => weeklyAverages[week].averageProtein);

  // Chart configurations
  const weightConfig = {
    labels,
    datasets: [
      {
        label: 'Average Weight',
        data: avgWeightData,
        borderColor: 'blue',
      },
    ],
  };

  const caloriesConfig = {
    labels,
    datasets: [
      {
        label: 'Average Calories',
        data: avgCaloriesData,
        borderColor: 'green',
      },
    ],
  };

  const weightOptions = {
    scales: {
      y: {
        min: 100, // minimum value
        max: 300, // maximum value
        ticks: {
          stepSize: 10, // difference between each tick
        },
      },
    },
  };

  const caloriesOptions = {
    scales: {
      y: {
        min: 1000,
        max: 4000,
        ticks: {
          stepSize: 100,
        },
      },
    },
  };

  const proteinOptions = {
    scales: {
      y: {
        min: 50,
        max: 250,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  const proteinConfig = {
    labels,
    datasets: [
      {
        label: 'Average Protein',
        data: avgProteinData,
        borderColor: 'red',
      },
    ],
  };
  


  return (
    <div>
      <h1>Trends</h1>
      <div>
        <h2>Average Weight</h2>
        <Line data={weightConfig} options={weightOptions} />
      </div>
      <div>
        <h2>Average Calories</h2>
        <Line data={caloriesConfig} options={caloriesOptions} />
      </div>
      <div>
        <h2>Average Protein</h2>
        <Line data={proteinConfig}  options={proteinOptions}/>
      </div>
    </div>
  );
  
};

export default TrendsChart;
