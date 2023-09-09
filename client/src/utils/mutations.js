import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      _id
      username
    }
  }
}
`;

export const ADD_USER = gql`
mutation CreateUser($username: String!, $firstname: String!, 
  $lastname: String!, $email: String!, $password: String!) {
  createUser(username: $username, firstname: $firstname, lastname: $lastname, email: $email, password: $password) {
    token
    user {
      _id
    }
  }
}
`;


export const CREATE_EXERCISE = gql`
mutation Mutation($name: String!, $sets: Int!, $reps: Int!) {
  createExercise(name: $name, sets: $sets, reps: $reps) {
    name
    sets
    reps
  }
}
`;

export const CREATE_WORKOUT = gql`
mutation createWorkout($name: String!) {
  createWorkout(name: $name) {
    name
  }
}
`;

export const ASSIGN_EXERCISE_TO_WORKOUT = gql `
mutation updateWorkout($workoutId: ID!, $name: String, $notes: String, $exerciseIds: [ID]) {
  updateWorkout(workoutId: $workoutId, name: $name, notes: $notes, exerciseIds: $exerciseIds) {
    _id
    exercises {
      _id
      name
      notes
      reps
      sets
      weight
    }
    name
    notes
  }
}
`;

export const DELETE_WORKOUT = gql `
mutation deleteWorkout($workoutId: ID!) {
  deleteWorkout(workoutId: $workoutId) {
    name
  }
}
`;

export const UPDATE_WORKOUT_NOTES = gql `
mutation updateWorkout($workoutId: ID!, $name: String, $notes: String, $exerciseIds: [ID]) {
  updateWorkout(workoutId: $workoutId, name: $name, notes: $notes, exerciseIds: $exerciseIds) {
    _id
    exercises {
      _id
      name
      notes
      reps
      sets
      weight
    }
    name
    notes
  }
}
`;