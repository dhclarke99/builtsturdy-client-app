import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from '@apollo/client';
import Header from './components/header';  // This will automatically import from Header/index.js
import Exercise from './pages/Exercise';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CreateExercise from './pages/CreateExercise';
import CreateWorkout from './pages/CreateWorkout';
import AssignWorkout from './pages/AssignWorkout';
import EditWorkout from './pages/EditWorkout';
// Construct our main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql',
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Exercise />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-exercise" element={<CreateExercise />} />
          <Route path="/create-workout" element={<CreateWorkout />} />
          <Route path="/assign-workout" element={<AssignWorkout />} />
          <Route path="/edit-workout/:id" element={<EditWorkout />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;
