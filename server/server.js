const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const User = require('./models/user');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const cors = require('cors');
const { searchIngredient } = require('./utils/nutritionApi');
require('dotenv').config();

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({
  origin: 'https://www.portal.builtsturdyblueprint.com', // replace with your application's actual origin
  credentials: true, // enable credentials for CORS
}));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/api/suggesticQuery', async (req, res) => {
  const { query }= req.body;
  const url = 'https://production.suggestic.com/graphql';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.SUGGESTIC_API_TOKEN}`,
        'sg-user': process.env.SUGGESTIC_SG_USER
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/searchIngredient/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const data = await searchIngredient(query);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});


app.use('/images', express.static(path.join(__dirname, '../client/images')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}


app.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  console.log("Received token:", token); // Existing Debugging line

  try {
    console.log("Attempting to find user with token:", token); // New Debugging line
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      console.log("User not found for token:", token); // New Debugging line
      console.log(res.status)
      return res.status(400).json({ message: 'Invalid token.' });
    }

    console.log("User found, verifying email for user:", user._id); // New Debugging line
    user.isEmailVerified = true;
    await user.updateOne({ $unset: { emailVerificationToken: 1 } });

    console.log("Email verified successfully for user:", user._id); // New Debugging line
    console.log(res.status)
    res.json({ message: 'Email verified successfully.', userId: user._id });
  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});



const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log('Successfully connected to the database');
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

startApolloServer(typeDefs, resolvers);
