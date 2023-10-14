const fetch = require('node-fetch');

const NUTRITIONIX_API_ENDPOINT = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
const API_KEY = '124d593d5330ccaa5ea5474947301872';
const APP_ID = '2223a171';

async function searchIngredient(query) {
  console.log("Starting searchIngredient function");
  console.log("Query received:", query);

  const headers = {
    'Content-Type': 'application/json',
    'x-app-id': APP_ID,
    'x-app-key': API_KEY
  };

  const body = JSON.stringify({
    query: query,
    timezone: "US/Eastern"
  });

  try {
    console.log("About to fetch data from Nutritionix API");
    const response = await fetch(NUTRITIONIX_API_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: body
    });

    console.log("Received response from Nutritionix API");
    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);

    if (!response.ok) {
      console.log("Response was not ok, throwing error");
      throw new Error('Network response was not ok');
    }

    console.log("Parsing response to JSON");
    const data = await response.json();
    console.log("Parsed data:", data);

    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
}

module.exports = {
  searchIngredient,
};
