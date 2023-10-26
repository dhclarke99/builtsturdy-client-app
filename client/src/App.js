import React, {useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import Auth from './utils/auth'
import Header from './components/header';  // This will automatically import from Header/index.js
import UserHeader from './components/UserHeader';  // This will automatically import from Header/index.js
import Login from './pages/Login';
import Logout from './pages/Logout';
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
import NutritionTrends from './pages/NutritionTrends';
import WorkoutTrends from './pages/WorkoutTrends';
import AdminNutritionTrends from './pages/AdminNutritionTrends.js';
import Verification from './pages/Verification';
import Account from './pages/Account'
import CreateRecipe from './pages/CreateRecipe';

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

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      'x-token': token ? token : "",
      'x-refresh-token': refreshtoken ? refreshtoken : "",
      'authorization': authorizationToken ? `Bearer ${authorizationToken}` : ""
    }
  });

  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const isAdmin = Auth.isLoggedInAndAdmin();

const isLoggedIn = Auth.loggedIn();

const App = () => {
 
  return (
    <ApolloProvider client={client}>
      <Router>
        <Header />
        {isLoggedIn && <UserHeader />}
        <Routes>
        <Route path="/" element={<HomeRedirect />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin/admindashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/admin/create-exercise" element={<CreateExercise />} />
          <Route path="/admin/create-workout" element={<CreateWorkout />} />
          <Route path="/admin/create-user" element={<CreateUser />} />
          <Route path="/admin/create-recipe" element={<CreateRecipe />} />
          <Route path="/admin/edit-workout/:id" element={<EditWorkout />} />
          <Route path="/admin/edit-exercise/:id" element={<EditExercise />} />
          <Route path="/admin/edit-schedule/:id" element={<EditSchedule />} />
          <Route path="/admin/user/:id" element={<UniqueUser />} />
          <Route path="/admin/create-schedule" element={<CreateSchedule />} />
          <Route path="/calendar" element={<UserCalendar />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/nutrition-trends" element={<NutritionTrends />}/>
          <Route path="/workout-trends" element={<WorkoutTrends />}/>
          <Route path="/admin/user/:id/nutrition-trends" element={<AdminNutritionTrends />}/>
          <Route path="/verify-email/:token" element={<Verification />}/>

        </Routes>
      </Router>
    </ApolloProvider>
  );
};

const HomeRedirect = () => {
  const navigate = useNavigate();
  const isLoggedIn = Auth.loggedIn();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/calendar');
    } else {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return null;
};

export default App;
