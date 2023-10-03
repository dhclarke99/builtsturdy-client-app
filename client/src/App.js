import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
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
import CreateSchedule from './pages/CreateSchedule';
import EditSchedule from './pages/EditSchedule';
import CreateUser from './pages/CreateUser';
import UserCalendar from './pages/UserCalendar';
import Nutrition from './pages/Nutrition';
import Trends from './pages/Trends';
import AdminTrends from './pages/AdminTrends.js';


// Construct our main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql',
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = new ApolloLink((operation, forward) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  const refreshtoken = localStorage.getItem('refreshToken');
  const authorizationToken = localStorage.getItem('id_token'); // Assuming 'id_token' is the key where you store the authorization token

  console.log("Token from Local Storage:", token);
  console.log("Refresh Token from Local Storage:", refreshtoken);
  console.log("Authorization Token from Local Storage:", authorizationToken);

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      'x-token': token ? token : "",
      'x-refresh-token': refreshtoken ? refreshtoken : "",
      'authorization': authorizationToken ? `Bearer ${authorizationToken}` : ""
    }
  });

  // Log the entire operation context to see what headers are being sent
  console.log("Operation Context after setContext:", operation.getContext());

  return forward(operation);
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
          <Route path="/calendar" element={<UserCalendar />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/trends" element={<Trends />}/>
          <Route path="/admin/user/:id/trends" element={<AdminTrends />}/>

        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;
