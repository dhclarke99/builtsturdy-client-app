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
mutation assignExercise($workoutId: ID!, $exerciseId: ID!) {
  assignExerciseToWorkout(workoutId: $workoutId, exerciseId: $exerciseId) {
    name
    exercises {
      name
    }
  }
}
`;

export const REMOVE_WORKOUT = gql `
mutation removeWorkout($workoutId: ID!) {
  removeWorkout(workoutId: $workoutId) {
    name
  }
}
`;