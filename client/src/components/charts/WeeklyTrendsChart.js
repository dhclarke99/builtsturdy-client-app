import React from 'react';
import { Line } from 'react-chartjs-2';
import '../../utils/css/WorkoutTrends.css'

const WeeklyTrendsChart = ({ weeklyAverages, currentWeight, caloricTarget }) => {
  // Prepare data for the charts
  console.log(weeklyAverages)
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
        min: currentWeight - 50, // minimum value
        max: currentWeight + 50, // maximum value
        ticks: {
          stepSize: 10,
          color: 'white' // difference between each tick
        },
        grid: {
          color: 'white' // Color for inner chart lines
        }
      },
      x: {
        ticks: {
          color: 'white' // Color for x-axis labels
        },
        grid: {
          color: 'white' // Color for inner chart lines
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white' // Color for legend text
        }
      }
    }
    
  };

  const caloriesOptions = {
    scales: {
      y: {
        min: caloricTarget - 1000, // minimum value
        max: caloricTarget + 250, // maximum value
        ticks: {
          stepSize: 100,
          color: 'white' // difference between each tick
        },
        grid: {
          color: 'white' // Color for inner chart lines
        }
      },
      x: {
        ticks: {
          color: 'white' // Color for x-axis labels
        },
        grid: {
          color: 'white' // Color for inner chart lines
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white' // Color for legend text
        }
      }
    }
  };

  const proteinOptions = {
    scales: {
      y: {
        min: currentWeight - 50, // minimum value
        max: currentWeight + 50, // maximum value
        ticks: {
          stepSize: 10,
          color: 'white' // difference between each tick
        },
        grid: {
          color: 'white' // Color for inner chart lines
        }
      },
      x: {
        ticks: {
          color: 'white' // Color for x-axis labels
        },
        grid: {
          color: 'white' // Color for inner chart lines
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white' // Color for legend text
        }
      }
    }
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
    
      <div className='chart'>
        <h2 className='chart-header'>Average Weight</h2>
        <Line data={weightConfig} options={weightOptions} />
      </div>
      <div className='chart'>
        <h2 className='chart-header'>Average Calories</h2>
        <Line data={caloriesConfig} options={caloriesOptions} />
      </div>
      <div className='chart'>
        <h2 className='chart-header'>Average Protein</h2>
        <Line data={proteinConfig}  options={proteinOptions}/>
      </div>
    </div>
  );
  
};

export default WeeklyTrendsChart;
