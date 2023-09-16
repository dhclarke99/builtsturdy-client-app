// Nutrition.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries'; 
import Auth from '../utils/auth';

const Nutrition = () => {
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id }, // Replace 'someUserId' with the actual user ID
  });

  const [dailyCalories, setDailyCalories] = useState(0);

  useEffect(() => {
    if (data && data.user) {
      const { currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience,  } = data.user;
      // Call your helper function to calculate daily calories
      const calculatedCalories = calculateDailyCalories(gender, height, age, weight, trainingExperience);
      setDailyCalories(calculatedCalories);
    }
  }, [data]);

  const calculateDailyCalories = (currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience) => {
    console.log(data.user)
    // Your actual calculation logic here
    return 2000; // Placeholder
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Nutrition Calculator</h1>
      <p>Your daily calorie target is: {dailyCalories} calories</p>
    </div>
  );
};

export default Nutrition;
