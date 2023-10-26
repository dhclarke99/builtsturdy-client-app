// Trends.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import { useParams } from 'react-router-dom';
import WeeklyTrendsChart from '../components/charts/WeeklyTrendsChart';
import DailyTrendsChart from '../components/charts/DailyTrendsChart';

const AdminNutritionTrends = () => {
  const [viewMode, setViewMode] = useState('weekly'); 
    const { id } = useParams();
const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: id },
  });

  const dailyAverages = {}; // Create an object for daily averages

  const handleViewModeChange = (event) => {
    setViewMode(event.target.value); // Update viewMode based on user selection
  };

 
  const groupedByWeek = {};
  const weeklyAverages = {};
  if (data && data.user && data.user.dailyTracking) {
    const sortedDailyTracking = [...data.user.dailyTracking].sort((a, b) => new Date(a.date) - new Date(b.date));
  
    sortedDailyTracking.forEach((day, index) => {
      const weekNumber = Math.floor(index / 7) + 1;
      if (!groupedByWeek[weekNumber]) {
        groupedByWeek[weekNumber] = [];
      }
      groupedByWeek[weekNumber].push(day);
    });
  
    // Calculate Weekly Averages
    Object.keys(groupedByWeek).forEach((weekNumber) => {
        const weekData = groupedByWeek[weekNumber];
      
        let totalWeight = 0;
        let totalCalories = 0;
        let totalProtein = 0;
        let countWeight = 0;
        let countCalories = 0;
        let countProtein = 0;
      
        weekData.forEach((day) => {
          if (day.weight !== null && day.weight !== 0) {
            totalWeight += day.weight;
            countWeight++;
          }
          if (day.calorieIntake !== null && day.calorieIntake !== 0) {
            totalCalories += day.calorieIntake;
            countCalories++;
          }
          if (day.proteinIntake !== null && day.proteinIntake !== 0) {
            totalProtein += day.proteinIntake;
            countProtein++;
          }
        });
      
        weeklyAverages[weekNumber] = {
          averageWeight: countWeight ? totalWeight / countWeight : null,
          averageCalories: countCalories ? totalCalories / countCalories : null,
          averageProtein: countProtein ? totalProtein / countProtein : null,
        };
      });

      // Calculate Daily Averages
    data.user.dailyTracking.forEach((day) => {
      const date = new Date(parseInt(day.date)).toDateString(); // Convert Unix timestamp to Date
    
      if (!dailyAverages[date]) {
        dailyAverages[date] = {
          averageWeight: null,
          averageCalories: null,
          averageProtein: null,
          countWeight: 0,
          countCalories: 0,
          countProtein: 0,
        };
      }
    
      if (day.weight !== null && day.weight !== 0) {
        dailyAverages[date].averageWeight += day.weight;
        dailyAverages[date].countWeight++;
      }
      if (day.calorieIntake !== null && day.calorieIntake !== 0) {
        dailyAverages[date].averageCalories += day.calorieIntake;
        dailyAverages[date].countCalories++;
      }
      if (day.proteinIntake !== null && day.proteinIntake !== 0) {
        dailyAverages[date].averageProtein += day.proteinIntake;
        dailyAverages[date].countProtein++;
      }
    });
    

    // Calculate daily averages by dividing the sums by counts
    Object.keys(dailyAverages).forEach((date) => {
      const average = dailyAverages[date];
      if (average.countWeight) average.averageWeight /= average.countWeight;
      if (average.countCalories) average.averageCalories /= average.countCalories;
      if (average.countProtein) average.averageProtein /= average.countProtein;
    });
  }


// Step 4: Prepare Data for Charting
// You can now use `weeklyAverages` to create your charts




  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1 className='trends-header'>{data.user.firstname}'s Nutrition Trends</h1>
      <div className="toggle-view">
        <label htmlFor="viewMode">Select View: </label>
        <select id="viewMode" onChange={handleViewModeChange} value={viewMode}>
          <option value="weekly">Weekly Trends</option>
          <option value="daily">Daily Trends</option>
        </select>
      </div>
      {viewMode === 'weekly' && (
        <WeeklyTrendsChart weeklyAverages={weeklyAverages} currentWeight={data.user.currentWeight} caloricTarget={data.user.caloricTarget} />
      )}
      {viewMode === 'daily' && (
        <DailyTrendsChart dailyAverages={dailyAverages} currentWeight={data.user.currentWeight} caloricTarget={data.user.caloricTarget}/>
      )}
    </div>
  );

};

export default AdminNutritionTrends;