import React from 'react';

const ExerciseList = ({ exercises }) => {
  console.log(exercises)
  return (
    <ul>
      {exercises.map((exercise, index) => (
        <li key={index}>
          {exercise.name} - {exercise.sets} sets of {exercise.reps}
        </li>
      ))}
    </ul>
  );
};

export default ExerciseList;
