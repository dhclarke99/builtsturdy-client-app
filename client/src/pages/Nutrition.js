// Nutrition.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import { ADD_DAILY_TRACKING } from '../utils/mutations';
import Auth from '../utils/auth';

const Nutrition = () => {

  let calories;
  let caloriesRounded;
  const [dailyCalories, setDailyCalories] = useState(0);
  const url = 'https://production.suggestic.com/graphql';

  const [trackingData, setTrackingData] = useState({
    date: '',
    weight: '',
    calorieIntake: '',
    proteinIntake: ''
  });
  const [updatedTracking, setUpdatedTracking] = useState({});
  const [currentStartWeek, setCurrentStartWeek] = useState(1);
  console.log(Auth.getProfile())
  console.log(Auth.getProfile().data._id)
  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },

  });



  useEffect(() => {
    if (data && data.user) {
      const { currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience } = data.user;
      // Call your helper function to calculate daily calories
      const calculatedCalories = calculateDailyCalories(currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience);
      setDailyCalories(calculatedCalories);
    }
  }, [data]);

  console.log(data)


  const [addDailyTracking] = useMutation(ADD_DAILY_TRACKING);




  const calculateDailyCalories = (currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, weight, trainingExperience) => {
    const mass = currentWeight * 0.453592
    const h = height * 2.53
    if (gender === "Male") {
      const s = 5;
    } else if (gender === "Female") {
      const s = -151;
    }


    const LBM = (mass * (100 - estimatedBodyFat)) / 100
    const BMRKatchMcardle = 370 + (21.6 * LBM)

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



  console.log(data)

  const handleInputChange = (dateUnix, week, type, value) => {
    const newTracking = { ...updatedTracking };
    if (!newTracking[week]) newTracking[week] = {};
    if (!newTracking[week][dateUnix]) newTracking[week][dateUnix] = {};
    newTracking[week][dateUnix][type] = value !== "" ? parseFloat(value) : null;
    setUpdatedTracking(newTracking);
    console.log(updatedTracking)
  };
  

  const calculateProteinPerc = async (calorieTarget, data) => {
    console.log(data.user.currentWeight)
    console.log(calorieTarget)
    if ((calorieTarget * .25) / 4 >= data.user.currentWeight) {
      const proteinPerc = 25
      console.log(proteinPerc)
      return proteinPerc
    } else {
      const proteinPercFull = (data.user.currentWeight * 4) / calorieTarget;
      const proteinPerc = Math.round(proteinPercFull)
      console.log(proteinPerc)
      return proteinPerc
    }

  }

  const handleSave = async () => {
    // Create a new array to hold the updated tracking data
    const newTrackingData = [];
    console.log(updatedTracking)
    // Loop through each week
    Object.keys(weeks).forEach((weekNumber) => {
      // Loop through each day in the week
      Object.keys(weeks[weekNumber]).forEach((dateUnix) => {
        // Create a new object to hold the data for this day
        const dayData = {
          date: dateUnix,
          weight: updatedTracking[weekNumber]?.[dateUnix]?.hasOwnProperty('weight') ? updatedTracking[weekNumber][dateUnix].weight : (weeks[weekNumber][dateUnix]?.weight || null),
          calorieIntake: updatedTracking[weekNumber]?.[dateUnix]?.hasOwnProperty('calorieIntake') ? updatedTracking[weekNumber][dateUnix].calorieIntake : (weeks[weekNumber][dateUnix]?.calorieIntake || null),
          proteinIntake: updatedTracking[weekNumber]?.[dateUnix]?.hasOwnProperty('proteinIntake') ? updatedTracking[weekNumber][dateUnix].proteinIntake : (weeks[weekNumber][dateUnix]?.proteinIntake || null),
        };

        // Add this day's data to the new tracking data array
        newTrackingData.push(dayData);
      });
    });

    // Now, newTrackingData is a complete array that includes all fields, whether they were edited or not
    console.log(newTrackingData);

    // Call your mutation to update the user's dailyTracking data
    await addDailyTracking({
      variables: { userId: Auth.getProfile().data._id, trackingData: newTrackingData }
    });
  };


  const weeks = {};
  if (data && data.user && data.user.dailyTracking) {

    const sortedDailyTracking = [...data.user.dailyTracking].sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(sortedDailyTracking)

    sortedDailyTracking.forEach((day, index) => {
      const dateUnix = day.date
      const weekNumber = Math.floor(index / 7) + 1;
      if (!weeks[weekNumber]) weeks[weekNumber] = {};
      weeks[weekNumber][dateUnix] = day; // Use Unix timestamp as a key
    });
  }
  console.log(weeks)

  const getTypeKey = (type) => {
    if (type === 'Weight') return 'weight';
    if (type === 'Calories') return 'calorieIntake';
    if (type === 'Protein') return 'proteinIntake';
  };

  const createMealPlanTemplate = async () => {
    console.log("template needs to be created")
    console.log(data)
    const description = data.user.mainPhysiqueGoal;
    const calorieTarget = dailyCalories;
    console.log(caloriesRounded)
    const proteinPerc = await calculateProteinPerc(calorieTarget, data)
    const carbsPerc = Math.round((100 - proteinPerc) / 2 + 5)
    const fatPerc = 100 - proteinPerc - carbsPerc
    const firstname = data.user.firstname
    const lastname = data.user.lastname

    console.log(description, calorieTarget, proteinPerc, carbsPerc, fatPerc, firstname, lastname,)
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

  const calculateWeekStartDate = (startDate, weekNumber) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weekNumber - 1) * 7);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

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
      <button onClick={handleSave}>Save</button>
      <button onClick={() => setCurrentStartWeek(Math.max(1, currentStartWeek - 4))}>Previous 4 Weeks</button>
      <button onClick={() => setCurrentStartWeek(currentStartWeek + 4)}>Next 4 Weeks</button>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Metric</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(weeks).slice(currentStartWeek - 1, currentStartWeek + 3).map((weekNumber) => (
            <React.Fragment key={weekNumber}>
              {['Weight', 'Calories', 'Protein'].map((type, index) => (
                <tr key={type}>
                  {index === 0 && <td rowSpan="3">Week {weekNumber} ({calculateWeekStartDate(parseInt(data.user.startDate), weekNumber)})</td>}
                  <td>{type}</td>
                  {Object.keys(weeks[weekNumber]).map((dateUnix) => (
                    <td key={dateUnix}>
                      <input
                        type="number"
                        value={
                          updatedTracking[weekNumber]?.[dateUnix]?.[getTypeKey(type)] ??
                          weeks[weekNumber][dateUnix]?.[getTypeKey(type)] ??
                          ""
                        }
                        onChange={(e) => handleInputChange(dateUnix, weekNumber, getTypeKey(type), e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default Nutrition;
