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
  mutation CreateExercise($name: String!, $sets: Int!, $reps: Int!) {
    createExercise(name: $name, sets: $sets, reps: $reps) {
      _id
      name
      sets
      reps
    }
  }
`;

export const CREATE_WORKOUT = gql`
  mutation CreateWorkout($name: String!, $notes: String!, $exercises: [ID!]!) {
    createWorkout(name: $name, notes: $notes, exercises: $exercises) {
      _id
      name
      notes
      exercises {
        _id
        name
      }
    }
  }
`;