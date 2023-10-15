import React, { useState } from 'react';
import '../utils/css/CreateRecipe.css'

const CreateRecipe = () => {
    const [query, setQuery] = useState('');
    const [recipeData, setRecipeData] = useState([]);
    const [recipeName, setRecipeName] = useState('');
    const [totalCalories, setTotalCalories] = useState(0);
    const [totalProtein, setTotalProtein] = useState(0);
    const [totalCarbs, setTotalCarbs] = useState(0);
    const [totalFat, setTotalFat] = useState(0);
    const [instructions, setInstructions] = useState('');

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleNameChange = (e) => {
        setRecipeName(e.target.value);
    };

    const handleInstructionsChange = (e) => {
        setInstructions(e.target.value);
    };

    const handleSubmit = async () => {
        const ingredients = query.split('\n');
        let newTotalCalories = 0;
        let newTotalProtein = 0;
        let newTotalCarbs = 0;
        let newTotalFat = 0;

        const fetchIngredientData = async (ingredient) => {
            const response = await fetch(`/api/searchIngredient/${encodeURIComponent(ingredient)}`);
            const data = await response.json();
            console.log(data)
            const food = data.foods[0];
            newTotalCalories += food.nf_calories;
            newTotalProtein += food.nf_protein;
            newTotalCarbs += food.nf_total_carbohydrate;
            newTotalFat += food.nf_total_fat;
            setRecipeData(oldData => [...oldData, food]);
        };

        for (const ingredient of ingredients) {
            await fetchIngredientData(ingredient).catch(error => console.error('Error:', error));
        }

        setTotalCalories(newTotalCalories);
        setTotalProtein(newTotalProtein);
        setTotalCarbs(newTotalCarbs);
        setTotalFat(newTotalFat);

        // Clear the query state to empty the textarea
        setQuery('');
    };


    const handleSaveRecipe = () => {
        // Code to save the recipe object in your model
        // For example, you might send `recipeData` and `recipeName` to your server here
    };

    const removeIngredient = (indexToRemove) => {
        const newRecipeData = recipeData.filter((_, index) => index !== indexToRemove);
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

        setRecipeData(newRecipeData);
        setTotalCalories(newTotalCalories);
        setTotalProtein(newTotalProtein);
        setTotalCarbs(newTotalCarbs);
        setTotalFat(newTotalFat);
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
                value={query}  // Set the value attribute to query
                placeholder="Enter ingredients, separated by line breaks">
            </textarea>
            <button className="recipe-button" onClick={handleSubmit}>Add Ingredients</button>

            <label>Instructions</label>
            <textarea
                className="recipe-textarea"
                onChange={handleInstructionsChange}
                placeholder="Enter detailed instructions, separated by line breaks">
            </textarea>

            <button className="recipe-button" onClick={handleSaveRecipe}>Save Recipe</button>

            <h2 className="recipe-total">Total Calories: {totalCalories}</h2>
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