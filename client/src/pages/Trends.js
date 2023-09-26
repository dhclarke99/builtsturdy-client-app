// Trends.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth';

const Trends = () => {
const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });

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
      const totalDays = weekData.length;
  
      const totalWeight = weekData.reduce((acc, day) => acc + day.weight, 0);
      const totalCalories = weekData.reduce((acc, day) => acc + day.calorieIntake, 0);
      const totalProtein = weekData.reduce((acc, day) => acc + day.proteinIntake, 0);
  
      weeklyAverages[weekNumber] = {
        averageWeight: totalWeight / totalDays,
        averageCalories: totalCalories / totalDays,
        averageProtein: totalProtein / totalDays,
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
        <h1>{data.user.firstname}'s Trends</h1>
    </div>
  );

};

export default Trends;