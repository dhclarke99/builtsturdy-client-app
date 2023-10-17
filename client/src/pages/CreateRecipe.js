import React, { useState } from 'react';
import '../utils/css/CreateRecipe.css';

const CreateRecipe = () => {
  const [query, setQuery] = useState('');
  const [recipeData, setRecipeData] = useState([]);
  const [recipeName, setRecipeName] = useState('');
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [instructions, setInstructions] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [servingSize, setServingSize] = useState('');

  const updateTotals = (newRecipeData) => {
    let newTotalCalories = 0;
    let newTotalProtein = 0;
    let newTotalCarbs = 0;
    let newTotalFat = 0;

    newRecipeData.forEach(food => {
      newTotalCalories += food.nf_calories;
      newTotalProtein += food.nf_protein;
      newTotalCarbs += food.nf_total_carbohydrate;
      newTotalFat += food.nf_total_fat;
    });

    setTotalCalories(newTotalCalories);
    setTotalProtein(newTotalProtein);
    setTotalCarbs(newTotalCarbs);
    setTotalFat(newTotalFat);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleNameChange = (e) => {
    setRecipeName(e.target.value);
  };

  const handleInstructionsChange = (e) => {
    setInstructions(e.target.value);
  };

  const renderSearchResults = () => {
    return searchResults.map((result, index) => (
      <div key={index} onClick={() => handleSelectIngredient(result.food_name)}>
        <h4>{result.food_name}</h4>
        <p>Serving Unit: {result.serving_unit}</p>
        {result.brand_name && <p>Brand: {result.brand_name}</p>}
        <img src={result.photo.thumb} alt={result.food_name} />
      </div>
    ));
  };

  const handleSubmit = async () => {
    const ingredients = query.split('\n');
    const newRecipeData = [];
  
    const fetchInstantData = async (ingredient) => {
      const instantResponse = await fetch(`/api/searchInstant/${encodeURIComponent(ingredient)}`);
      const instantData = await instantResponse.json();
      return instantData.branded[0] ? instantData.branded[0].food_name : ingredient;
    };
  
    const fetchIngredientData = async (ingredient) => {
      const response = await fetch(`/api/searchIngredient/${encodeURIComponent(ingredient)}`);
      const data = await response.json();
      const food = data.foods[0];
      newRecipeData.push(food);
    };
  
    for (const ingredient of ingredients) {
      const brandedName = await fetchInstantData(ingredient).catch(error => console.error('Instant Error:', error));
      await fetchIngredientData(brandedName).catch(error => console.error('Ingredient Error:', error));
    }
  
    setRecipeData(oldData => [...oldData, ...newRecipeData]);
    updateTotals([...recipeData, ...newRecipeData]);
    setQuery('');
  };

  const handleSaveRecipe = () => {
    // Code to save the recipe object in your model
    // For example, you might send `recipeData` and `recipeName` to your server here
  };

  const removeIngredient = (indexToRemove) => {
    const newRecipeData = recipeData.filter((_, index) => index !== indexToRemove);
    setRecipeData(newRecipeData);
    updateTotals(newRecipeData);
  };

  const handleSearch = async () => {
    const response = await fetch(`/api/searchInstant/${encodeURIComponent(query)}`);
    const data = await response.json();
    const commonWithFlag = data.common.map(item => ({ ...item, isBranded: false }));
    const brandedWithFlag = data.branded.map(item => ({ ...item, isBranded: true }));
    setSearchResults([...commonWithFlag, ...brandedWithFlag]);
  };

  const handleSelectIngredient = (selectedObject) => {
    setSelectedIngredient(selectedObject);
  };

  const handleServingSizeChange = (e) => {
    setServingSize(e.target.value);
  };

  const handleAddIngredient = async () => {
    console.log("Selected Ingredient:", selectedIngredient);  // Debugging line
    console.log("Serving Size:", servingSize);  // Debugging line
  
    if (!selectedIngredient || !servingSize) {
      console.error("Either selected ingredient or serving size is missing.");
      return;
    }
  
    const selectedIngredientName = encodeURIComponent(selectedIngredient.food_name);
    const selectedIngredientBrand = selectedIngredient.isBranded ? encodeURIComponent(selectedIngredient.brand_name) : '';
    const selectedIngredientServingSize = encodeURIComponent(servingSize);
  
    const queryString = `${selectedIngredientBrand} ${selectedIngredientName}, ${selectedIngredientServingSize}`;
    console.log(queryString)
    try {
      const response = await fetch(`/api/searchIngredient/${queryString}`);
      if (response.status !== 200) {
        console.error("Server returned an error:", response.status);
        return;
      }
      const data = await response.json();
      const food = data.foods[0];
      if (!food) {
        console.error("No food data returned from API.");
        return;
      }
      
      setRecipeData(oldData => [...oldData, food]);
      updateTotals([...recipeData, food]);
      setSelectedIngredient(null);
      setServingSize('');
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  

  

  return (
    <div className="recipe-container">
      <label>Recipe Name</label>
      <input
        className="recipe-input"
        type="text"
        placeholder="Recipe Name"
        onChange={handleNameChange}
      />

      <label>Ingredients</label>
      <textarea
        className="recipe-textarea"
        onChange={handleQueryChange}
        value={query}
        placeholder="Enter ingredients, separated by line breaks">
      </textarea>
      <button className="recipe-button" onClick={handleSubmit}>Add Ingredients</button>

      <button className="recipe-button" onClick={handleSearch}>Search Ingredients</button>

      <ul>
      {searchResults.map((result, index) => (
  <li key={index} onClick={() => handleSelectIngredient(result)}>
    <h5>{result.food_name}</h5>
    <p>Serving Unit: {result.serving_unit}</p>
    {result.isBranded && <p>Brand: {result.brand_name}</p>}
  </li>
))}
</ul>

      {selectedIngredient && (
        <div>
          <h5>Selected: {selectedIngredient.food_name}</h5>
          <input
            type="text"
            placeholder="Enter serving size"
            value={servingSize}
            onChange={handleServingSizeChange}
          />
          <button onClick={handleAddIngredient}>Add with Serving Size</button>
        </div>
      )}

      <label>Instructions</label>
      <textarea
        className="recipe-textarea"
        onChange={handleInstructionsChange}
        placeholder="Enter detailed instructions, separated by line breaks">
      </textarea>

      <button className="recipe-button" onClick={handleSaveRecipe}>Save Recipe</button>

      <h2 className="recipe-total">{recipeName}</h2>
      <ul>
        <h3>Calories: {Math.round(totalCalories)}</h3>
        <h3>Protein: {Math.round(totalProtein)}</h3>
        <h3>Fats: {Math.round(totalFat)}</h3>
        <h3>Carbs: {Math.round(totalCarbs)}</h3>
      </ul>
      <div className="recipe-results">
        {recipeData.map((food, index) => (
          <div className="recipe-item" key={index}>
            <h2 className="recipe-item-title">{food.food_name} - {food.serving_weight_grams} grams</h2>
            <p className="recipe-item-info">Calories: {food.nf_calories}</p>
            <p className="recipe-item-info">Protein: {food.nf_protein}g</p>
            <p className="recipe-item-info">Carbs: {food.nf_total_carbohydrate}g</p>
            <p className="recipe-item-info">Fat: {food.nf_total_fat}g</p>
            <button onClick={() => removeIngredient(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateRecipe;
