import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from '@apollo/client';
import Header from './components/header';  // This will automatically import from Header/index.js
import Exercise from './pages/Exercise';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CreateExercise from './pages/CreateExercise';
import CreateWorkout from './pages/CreateWorkout';
import EditWorkout from './pages/EditWorkout';
import EditExercise from './pages/EditExercise';
import UniqueUser from './pages/UniqueUser';
import CreateSchedule from './pages/CreateSchedule'
import EditSchedule from './pages/EditSchedule'
import CreateUser from './pages/CreateUser'

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
          <Route path="/admin/admindashboard" element={<AdminDashboard />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/admin/create-exercise" element={<CreateExercise />} />
          <Route path="/admin/create-workout" element={<CreateWorkout />} />
          <Route path="/admin/create-user" element={<CreateUser />} />
          <Route path="/admin/edit-workout/:id" element={<EditWorkout />} />
          <Route path="/admin/edit-exercise/:id" element={<EditExercise />} />
          <Route path="/admin/edit-schedule/:id" element={<EditSchedule />} />
          <Route path="/admin/user/:id" element={<UniqueUser />} />
          <Route path="/admin/create-schedule" element={<CreateSchedule />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;
