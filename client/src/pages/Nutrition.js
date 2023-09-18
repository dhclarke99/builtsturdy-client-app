// Nutrition.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries'; 
import Auth from '../utils/auth';

const Nutrition = () => {
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id }, // Replace 'someUserId' with the actual user ID
  });
  let calories;
  let caloriesRounded;
  const [dailyCalories, setDailyCalories] = useState(0);
  const url = 'https://production.suggestic.com/graphql'; // Replace with your API endpoint

  useEffect(() => {
    if (data && data.user) {
      const { currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience } = data.user;
      // Call your helper function to calculate daily calories
      const calculatedCalories = calculateDailyCalories(currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience);
      setDailyCalories(calculatedCalories);
    }
  }, [data]);

  console.log(data)

  const calculateDailyCalories = (currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience) => {
    const mass = currentWeight * 0.453592
    const h = height * 2.53
    if (gender === "Male") {
        const s = 5;
    } else if (gender === "Female") {
        const s = -151;
    }
console.log(estimatedBodyFat)
    const LBM = (mass * (100-estimatedBodyFat))/100
    const BMRKatchMcardle = 370 + (21.6*LBM)

    const BMR = BMRKatchMcardle * 1.55
   
    
    if (trainingExperience === "Beginner" && mainPhysiqueGoal === "Burn Fat") {
       calories = BMR - 500
       caloriesRounded = Math.round(calories)
       
    } else if (trainingExperience === "Beginner" && mainPhysiqueGoal === "Build Muscle") {
      calories = BMR + 500
      caloriesRounded = Math.round(calories)
    
    } else if (trainingExperience === "Intermediate" && mainPhysiqueGoal === "Burn Fat") {
       calories = BMR - 300
       caloriesRounded = Math.round(calories)
     
    } else if (trainingExperience === "Intermediate" && mainPhysiqueGoal === "Build Muscle") {
      calories = BMR + 300
      caloriesRounded = Math.round(calories)
     
    }

    return caloriesRounded; // Round to the nearest whole number

  };

  const createMealPlanTemplate = async () => {
    console.log("template needs to be created")

  }

  const generateMealPlan = async () => {

  }

  const checkMealTemplate = async () => {
    const existingMealTemplateQuery = `
    query {
      mealPlanTemplates {
        edges {
          node {
            id
            description
            createdAt
            coachId
            isPublic
            days {
              day
              meals {
                recipe {
                  name
                }
                calories
                numOfServings
              }
            }
          }
        }
      }
    }`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token b51a14125d03fa5491b5ed14c9d7a3e1a7c3854d`
      },
      body: JSON.stringify({ query: existingMealTemplateQuery })
    })
    .then(response => response.json())
    .then(templateData => {
        console.log(templateData)
        console.log(templateData.data.mealPlanTemplates.edges)

        if (templateData.data.mealPlanTemplates.edges.length === 0) {
          createMealPlanTemplate()
        } else {
          console.log("Templates already exist")
        }
     
    })
    .catch(error => console.error('Error:', error))
    console.log(dailyCalories)

  }
  useEffect(() => {
   
    const programQuery = `{
        myProfile {
          id
          program {
            id
            name
          }
        }
      }`; 
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token b51a14125d03fa5491b5ed14c9d7a3e1a7c3854d`,
        'sg-user': '1f1a1f0f-0fc4-4c20-98eb-ee601ebf2863'
      },
      body: JSON.stringify({ query: programQuery })
    })
    .then(response => response.json())
    .then(programData => {
        console.log(programData)
        const programId = programData.data.myProfile.program.id
        console.log(programId)
        

       
        
    })
    .catch(error => console.error('Error:', error));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
        <h1>Nutrition Calculator</h1>
       <h2>Your Personal Stats</h2>
       <li>Age: {data.user.age}</li>
       <li>Gender: {data.user.gender}</li>
       <li>Height: {data.user.height}</li>
       <li>Weight: {data.user.currentWeight}</li>
       <li>Body Fat: {data.user.estimatedBodyFat}</li>
       <li>Experience: {data.user.trainingExperience}</li>
       <li>Goal: {data.user.mainPhysiqueGoal}</li>
      
      <p>Based on your stats, your daily calorie target is: {dailyCalories} calories</p>
      <button onClick={checkMealTemplate}>Generate Meal Plan</button>
    </div>
  );
};

export default Nutrition;
