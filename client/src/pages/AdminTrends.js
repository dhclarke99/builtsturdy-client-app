// Trends.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import { useParams } from 'react-router-dom';
import Auth from '../utils/auth';
import TrendsChart from '../components/charts/WeeklyTrendsChart';

const Trends = () => {
    const { id } = useParams();
const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: id },
  });

 
console.log(id)
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
  }
  console.log(groupedByWeek)
  console.log(weeklyAverages)

// Step 4: Prepare Data for Charting
// You can now use `weeklyAverages` to create your charts




  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.user.firstname}'s Weekly Trends</h1>
      <TrendsChart weeklyAverages={weeklyAverages} currentWeight={data.user.currentWeight} caloricTarget={data.user.caloricTarget}/>
    </div>
  );

};

export default Trends;