// Nutrition.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries'; 
import { ADD_DAILY_TRACKING } from '../utils/mutations'; 
import Auth from '../utils/auth';

const Nutrition = () => {
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id }, // Replace 'someUserId' with the actual user ID
  });
  let calories;
  let caloriesRounded;
  const [dailyCalories, setDailyCalories] = useState(0);
  const url = 'https://production.suggestic.com/graphql'; // Replace with your API endpoint

  const [trackingData, setTrackingData] = useState({
    weight: '',
    calorieIntake: '',
    proteinIntake: ''
  });

  const [addDailyTracking] = useMutation(ADD_DAILY_TRACKING);
  

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
console.log(caloriesRounded)
    return caloriesRounded; // Round to the nearest whole number

  };

  useEffect(() => {
    if (data && data.user) {
      const { currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience } = data.user;
      // Call your helper function to calculate daily calories
      const calculatedCalories = calculateDailyCalories(currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience);
      setDailyCalories(calculatedCalories);
    }
  }, [data]);

  console.log(data)

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTrackingData({
      ...trackingData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    await addDailyTracking({
      variables: { userId: Auth.getProfile().data._id, trackingData }
    });
  };

  const calculateProteinPerc = async (calorieTarget, data) => {
console.log(data.user.currentWeight)
console.log(calorieTarget)
    if ((calorieTarget*.25)/4 >= data.user.currentWeight) {
      const proteinPerc = 25
      console.log(proteinPerc)
      return proteinPerc
    } else {
      const proteinPercFull = (data.user.currentWeight*4)/calorieTarget;
      const proteinPerc = Math.round(proteinPercFull)
      console.log(proteinPerc)
      return proteinPerc
    }
    
  }

  const createMealPlanTemplate = async () => {
    console.log("template needs to be created")
    console.log(data)
    const description = data.user.mainPhysiqueGoal;
    const calorieTarget = dailyCalories;
    console.log(caloriesRounded)
   const proteinPerc = await calculateProteinPerc(calorieTarget, data)
    const carbsPerc = Math.round((100 - proteinPerc)/2 + 5)
    const fatPerc = 100 - proteinPerc - carbsPerc
    const firstname = data.user.firstname
    const lastname = data.user.lastname

    console.log(description, calorieTarget, proteinPerc, carbsPerc, fatPerc, firstname, lastname, )
    // const createTemplateMutation = `
    // mutation {
    //   createMealPlanTemplate(
    //     description: "Custom Meal Plan Template"
    //     customOptions: {
    //     calories: 1500
    //     carbsPerc: 45
    //     proteinPerc: 25
    //     fatPerc: 30
    //     program: "UHJvZ3JhbTozMzNhZjZiYi0xYTg4LTQzYzQtYjExZC1kYjJjZWNkMjk3YjA="
    //     }
    //     name: "New Meal Plan Template"
    //   )
    //   {
    //     message
    //     id
    //     success
    //   }
    // }
    // `

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
            name
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
          console.log("Templates already exist:", templateData)
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
      <h2>Daily Tracking</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Weight:
          <input 
            type="number" 
            name="weight" 
            value={trackingData.weight} 
            onChange={handleInputChange} 
          />
        </label>
        <label>
          Calorie Intake:
          <input 
            type="number" 
            name="calorieIntake" 
            value={trackingData.calorieIntake} 
            onChange={handleInputChange} 
          />
        </label>
        <label>
          Protein Intake:
          <input 
            type="number" 
            name="proteinIntake" 
            value={trackingData.proteinIntake} 
            onChange={handleInputChange} 
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      <h2>Your Tracking History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight</th>
            <th>Calorie Intake</th>
            <th>Protein Intake</th>
          </tr>
        </thead>
        <tbody>
          {data.user.dailyTracking.map((entry, index) => (
            <tr key={index}>
              <td>{new Date(parseInt(entry.date)).toLocaleDateString()}</td>
              <td>
                <input 
                  type="number" 
                  value={entry.weight || ''} 
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={entry.calorieIntake || ''} 
                  onChange={(e) => handleInputChange(index, 'calorieIntake', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={entry.proteinIntake || ''} 
                  onChange={(e) => handleInputChange(index, 'proteinIntake', e.target.value)} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Nutrition;
