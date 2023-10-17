// Nutrition.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import { ADD_DAILY_TRACKING, UPDATE_USER_MEAL_PLAN_TEMPLATE } from '../utils/mutations';
import Auth from '../utils/auth';
import { Link } from 'react-router-dom';
import '../utils/css/UserNutrition.css';



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
  const [updateMealPlan] = useMutation(UPDATE_USER_MEAL_PLAN_TEMPLATE);
  const [mealPlanData, setMealPlanData] = useState(null);
  const [showTab, setShowTab] = useState('tracking');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const recipeRef = useRef(null);
  const mealPlanRef = useRef(null);
  const trackerRef = useRef(null);

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
                instructions
              }
              calories
              numOfServings
            }
          }
        }
      }
    }
  }`

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




  const calculateDailyCalories = (currentWeight, estimatedBodyFat, mainPhysiqueGoal, gender, height, age, trainingExperience) => {
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

    window.location.reload();
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

  const assignToUser = async (id) => {
    console.log("assigning to user")
    console.log(id)
    const userId = Auth.getProfile().data._id
    console.log(userId)

    try {
      const updatedUserData = await updateMealPlan({ variables: { userId: userId, mealPlanTemplate: id } });
      console.log("success!")
      window.location.reload()
    } catch (error) {
      console.error("Failed to update meal plan:", error);
    }
  }

  const createMealPlanTemplate = async () => {
    try {
      console.log("template being created...");
      console.log(data);

      const proteinPerc = Math.round(((data.user.proteinTarget * 4) / data.user.caloricTarget) * 100);
      const carbsPerc = Math.round(((data.user.carbohydrateTarget * 4) / data.user.caloricTarget) * 100);
      const fatPerc = Math.round(((data.user.fatTarget * 9) / data.user.caloricTarget) * 100);
      const firstname = data.user.firstname;
      const lastname = data.user.lastname;
      const description = data.user.mainPhysiqueGoal;

      const createTemplateMutation = `
        mutation {
          createMealPlanTemplate(
            description: "${firstname}'s ${description} meal plan template at ${data.user.currentWeight} and ${data.user.caloricTarget} calories",
            customOptions: {
              calories: ${data.user.caloricTarget},
              carbsPerc: ${carbsPerc},
              proteinPerc: ${proteinPerc},
              fatPerc: ${fatPerc},
              program: "UHJvZ3JhbTo2ZmI3ZDFlMy1lODYwLTRmNjItODAzOS0zYWRkZWM2YWU4MDE="
            },
            name: "${firstname} ${lastname}'s Meal Plan Template"
          ) {
            message,
            success
          }
        }
      `;

      const response = await fetch('/api/suggesticMutation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: createTemplateMutation })
      });

      if (!response.ok) {
        throw new Error('Failed to create meal plan template');
      }

      const returnData = await response.json();
      console.log(returnData);

      const templateResponse = await fetch('/api/suggesticMutation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
         
        },
        body: JSON.stringify({ query: existingMealTemplateQuery })
      });

      if (!templateResponse.ok) {
        throw new Error('Failed to fetch existing meal plan templates');
      }

      const templateData = await templateResponse.json();
      console.log(templateData);

      const checkDescription = `${firstname}'s ${description} meal plan template at ${data.user.currentWeight} and ${data.user.caloricTarget} calories`;
      const trimmedDescription = checkDescription.trim();

      const idToGenerate = templateData.data.mealPlanTemplates.edges.findIndex(plan => plan.node.description.trim() === trimmedDescription);
      const matchingTemplateId = templateData.data.mealPlanTemplates.edges[idToGenerate].node.id;

      console.log(matchingTemplateId);

      await assignToUser(matchingTemplateId)
      return matchingTemplateId;

    } catch (error) {
      console.error('Error:', error);
    }
  }

  const generateMealPlan = async () => {
    if (data.user.mealPlanTemplate === null) {
      console.log("need to generate template")
      await createMealPlanTemplate();

    }
    console.log("meal plan generating...")
    console.log(data.user.mealPlanTemplate)
    const generateMeals = `
    mutation {
      generateMealPlan(
        fromTemplate: "${data.user.mealPlanTemplate}"
      ) {
        success
        message
        mealPlan {
          day
          date
          meals {
            id
            calories
            meal
            numOfServings
            recipe {
              id
              name
              mainImage
              numberOfServings
              ingredientLines
              ingredients{
                name
              }
            ingredientsCount
              instructions
              numberOfServings
              nutrientsPerServing {
                calories
                protein
                fat
                carbs
              }
            }
          }
        }
      }
    }`

    fetch('/api/suggesticQuery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: generateMeals })
    })
      .then(response => response.json())
      .then(mealPlan => {
        console.log(mealPlan);
        setMealPlanData(mealPlan.data.generateMealPlan.mealPlan);
        setShowTab('mealPlan')
        mealPlanRef.current.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => console.error('Error:', error))
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

      fetch('/api/suggesticQuery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const calculateDailyMacros = (meal) => {
    const totalProtein = Math.round(meal.recipe.nutrientsPerServing.protein * meal.numOfServings)
    return totalProtein
  }

  const renderMealDetails = async (recipe) => {
    await setSelectedRecipe(recipe); // Update this line
    recipeRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const setDailyTrackingDiv = async () => {
    await setShowTab('tracking');
    trackerRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  const setMealPlanDiv = async () => {
    await setShowTab('mealPlan');
    mealPlanRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  // Step 1: Preprocess the mealPlanData to rename multiple snacks
  const preprocessedMealPlanData = mealPlanData?.map(day => {
    const snackCount = day.meals.filter(meal => meal.meal === 'Snack').length;
    if (snackCount > 1) {
      let snackIndex = 1;
      day.meals = day.meals.map(meal => {
        if (meal.meal === 'Snack') {
          return { ...meal, meal: `Snack ${snackIndex++}` };
        }
        return meal;
      });
    }
    return day;
  });

  const calculateDailyTotals = (dayNumber, mealPlanData) => {
    const mealsForDay = mealPlanData.find(day => day.day === dayNumber)?.meals || [];
    let totalCalories = 0;
    let totalProtein = 0;

    mealsForDay.forEach(meal => {
      totalCalories += Math.round(meal.calories);
      totalProtein += calculateDailyMacros(meal); // Assuming this function returns a number
    });

    return { totalCalories, totalProtein };
  };


  // Step 2: Render the table (use preprocessedMealPlanData instead of mealPlanData)


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="nutrition-container">
      <div className="header-section">
        <h1>{data.user.firstname}'s Nutrition Calculator</h1>
        

        <p>Based on your stats, your daily calorie target is: {data.user.caloricTarget} calories</p>
        <p>You should eat {data.user.proteinTarget} grams of protein per day.</p>

        <button onClick={generateMealPlan}>Generate Meal Plan</button>
      </div>

      <div className="tabs">
        <button onClick={() => setMealPlanDiv()}>Meal Plan</button>
        <button onClick={() => setDailyTrackingDiv()}>Daily Tracking</button>
      </div>

      {showTab === 'mealPlan' && selectedRecipe && (
        <div ref={recipeRef} className="recipe-details">
          <div className="recipe-header">
            <h3 className="recipe-title">{selectedRecipe.name}</h3>
            <img className="recipe-image" src={selectedRecipe.mainImage} alt={selectedRecipe.name} />
            <h5>Recipe makes {selectedRecipe.numberOfServings} servings</h5>
          </div>
          <div className='recipe-body'>
            <h5 className="ingredients-title">Ingredients:</h5>
            <ol className="ingredients-list">
              {selectedRecipe.ingredientLines.map((ingredient, index) =>
                <li key={index} className="ingredient-item">{ingredient}</li>
              )}
            </ol>
            <h5 className="instructions-title">Instructions:</h5>
            <ol className="instructions-list">
              {selectedRecipe.instructions.map((instruction, index) =>
                <li key={index} className="instruction-item">{instruction}</li>
              )}
            </ol>
          </div>
          <div className='recipe-footer'>
            <div className='recipe-footer-header'>
              <h5 className='macro-title'>MacroNutrient Breakdown (per serving)</h5>
            </div>
            <div className='recipe-footer-body'>
              <p className='macro-summary'>Calories: {selectedRecipe.nutrientsPerServing.calories}</p>
              <p className='macro-summary'>Protein: {selectedRecipe.nutrientsPerServing.protein}</p>
              <p className='macro-summary'>Carbs: {selectedRecipe.nutrientsPerServing.carbs} </p>
              <p className='macro-summary'>Fat: {selectedRecipe.nutrientsPerServing.fat} </p>
            </div>

          </div>

        </div>
      )}

      {showTab === 'mealPlan' && (
        <div ref={mealPlanRef}>
          {mealPlanData ? (
            <div className='table-wrapper'>
              <div className='generated-meal-plan'>
                <h2>Your Meal Plan</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Meal Type</th>
                      <th>Day 1</th>
                      <th>Day 2</th>
                      <th>Day 3</th>
                      <th>Day 4</th>
                      <th>Day 5</th>
                      <th>Day 6</th>
                      <th>Day 7</th>
                    </tr>
                  </thead>
                  <tbody>

                    {Array.from(new Set(preprocessedMealPlanData.flatMap(day => day.meals.map(meal => meal.meal)))).map((mealType) => (
                      <tr key={mealType}>
                        <td>{mealType}</td>
                        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
                          const meal = preprocessedMealPlanData.find((d) => d.day === day)?.meals.find((m) => m.meal === mealType);
                          return (
                            <td key={day} onClick={() => meal && renderMealDetails(meal.recipe)}>
                              {meal ? (
                                <>
                                  <div>{meal.recipe.name}</div>
                                  <img src={meal.recipe.mainImage} alt={meal.recipe.name} />
                                  <p>{meal.numOfServings} servings</p>
                                  <p>{Math.round(meal.calories)} calories</p>
                                  <p>Protein: {calculateDailyMacros(meal)}</p>
                                </>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}


                  
                  <tr>
                    <td>Totals</td>
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
                      const { totalCalories, totalProtein } = calculateDailyTotals(day, preprocessedMealPlanData);
                      return (
                        <td key={day}>
                          <p>{totalCalories} calories</p>
                          <p>{totalProtein} protein</p>
                        </td>
                      );
                    })}
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <h2>No Meal Plan Data Available</h2>
          )}
        </div>
      )}

      {showTab === 'tracking' && (
        <div ref={trackerRef} className='table-wrapper'>
          <div >
            <div className='track-nutrition-header'>
          <h2>Track Nutrition</h2>
          <div className='toggle-weeks'>

            <button id='next' onClick={() => setCurrentStartWeek(Math.max(1, currentStartWeek - 4))}>Previous 4 Weeks</button>
            <button id='previous' onClick={() => setCurrentStartWeek(currentStartWeek + 4)}>Next 4 Weeks</button>
            </div>
            </div>
          <div className='daily-tracking'>
            
            
            <table>
              <thead>
                <tr>
                  <th className='table-header'>Week</th>
                  <th className='table-header'>Metric</th>
                  <th className='table-header'>Monday</th>
                  <th className='table-header'>Tuesday</th>
                  <th className='table-header'>Wednesday</th>
                  <th className='table-header'>Thursday</th>
                  <th className='table-header'>Friday</th>
                  <th className='table-header'>Saturday</th>
                  <th className='table-header'>Sunday</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(weeks).slice(currentStartWeek - 1, currentStartWeek + 3).map((weekNumber) => (
                  <React.Fragment key={weekNumber}>
                    {['Weight', 'Calories', 'Protein'].map((type, index) => (
                      <tr key={type} className={`week-${weekNumber}`}>
                        {index === 0 && <td className='table-header' rowSpan="3">Week {weekNumber} ({calculateWeekStartDate(parseInt(data.user.startDate), weekNumber)})</td>}
                        <td className='table-header'>{type}</td>
                        {Object.keys(weeks[weekNumber]).map((dateUnix) => (
                          <td key={dateUnix}>
                            <input
                              type="number"
                              value={
                                (typeof updatedTracking[weekNumber]?.[dateUnix]?.[getTypeKey(type)] !== 'undefined'
                                  ? updatedTracking[weekNumber]?.[dateUnix]?.[getTypeKey(type)]
                                  : typeof weeks[weekNumber][dateUnix]?.[getTypeKey(type)] !== 'undefined'
                                    ? weeks[weekNumber][dateUnix]?.[getTypeKey(type)]
                                    : null) !== null ? (updatedTracking[weekNumber]?.[dateUnix]?.[getTypeKey(type)] || weeks[weekNumber][dateUnix]?.[getTypeKey(type)] || "").toString() : ""
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
            
          </div>
          <div className='save-viewtrends'>
          
              <Link to={`/trends`}>
              <button id='trends-button'>
                View Trends
                </button>
                </Link>
               
            <button id='save-button' onClick={handleSave}>Save</button>
            
            </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
