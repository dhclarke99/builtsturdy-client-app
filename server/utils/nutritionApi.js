const fetch = require('node-fetch');

const NUTRITIONIX_API_ENDPOINT_NUTRIENTS = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
const NUTRITIONIX_API_ENDPOINT_SEARCH = 'https://trackapi.nutritionix.com/v2/search/instant';
const API_KEY = '124d593d5330ccaa5ea5474947301872';
const APP_ID = '2223a171';

async function searchIngredient(query) {
  return await makeApiCall(NUTRITIONIX_API_ENDPOINT_NUTRIENTS, query, 'POST');
}

async function searchInstant(query) {
  try {
    const response = await makeApiCall(NUTRITIONIX_API_ENDPOINT_SEARCH, query, 'GET');
    console.log("Response from searchInstant:", response);
    return response;
  } catch (error) {
    console.error("Error in searchInstant:", error);
    throw error;
  }
}

async function makeApiCall(endpoint, query, method = 'POST') {
  console.log("Starting API call function");
  
  // Check if query is undefined or null
  if (!query) {
    console.error("Query is undefined or null");
    throw new Error("Query is undefined or null");
  }

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

  // Initialize requestOptions
  const requestOptions = {
    method: method,
    headers: headers
  };

  // If method is POST, add body to requestOptions
  if (method === 'POST') {
    requestOptions.body = body;
  }

  // If method is GET, add query as URL parameter
  if (method === 'GET') {
    endpoint += `?query=${encodeURIComponent(query)}`;
  }

  try {
    console.log("Request details:", {
      endpoint,
      method,
      headers,
      body: method === 'POST' ? body : 'None'
    });

    console.log(`About to fetch data from Nutritionix API: ${endpoint}`);
    const response = await fetch(endpoint, requestOptions);

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
  searchInstant
};
