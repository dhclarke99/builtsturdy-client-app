import React, { useEffect, useState } from 'react';
import ExerciseList from '../components/ExerciseList';
import { QUERY_EXERCISES } from '../utils/queries';
import { useQuery } from '@apollo/client';

const Exercise = () => {
  // Use Apollo's useQuery hook to fetch data
  const { loading, error, data } = useQuery(QUERY_EXERCISES);

  // Show a loading message while data is being fetched
  if (loading) return <p>Loading...</p>;

  // Show an error message if there is an issue with the GraphQL query
  if (error) return <p>Error: {error.message}</p>;

  // Extract the exercises from the data object
  const exercises = data.exercises || [];

  return (
    <div>
      <h2>Exercises</h2>
      <ExerciseList exercises={exercises} />
    </div>
  );
};

export default Exercise;
