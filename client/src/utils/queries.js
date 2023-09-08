import { gql } from '@apollo/client';

export const QUERY_EXERCISES = gql`
query Query {
    exercises {
      _id
      name
      reps
      sets
      weight
      notes
    }
  }
`;

export const QUERY_USER_by_id = gql`
query findUserById($userId: String!) {
  user(id: $userId) {
    _id
    email
    firstname
    lastname
    schedules {
      _id
      userId
      workouts {
        day
        workoutId
      }
    }
    username
  }
}
`;

export const QUERY_ME = gql`
query Query {
  me {
    eggplants
    polls { 
      title
      description
      value
      option1
      option2
    }
  }
}
`;

export const FETCH_ALL_WORKOUTS = gql`
query Query {
  workouts {
    _id
    name
    notes
    exercises {
      _id
      name
      sets
      reps
    }
  }
}
`;

export const  FETCH_ALL_USERS = gql `
query findAllUsers {
  users {
    _id
    email
    firstname
    lastname
    username
    schedules {
      _id
      workouts {
        day
        workoutId
      }
    }
    
  }
}
`;

export const FETCH_WORKOUT_BY_ID = gql`
query findWorkoutById($workoutId: ID!) {
  workout(workoutId: $workoutId) {
    name
  }
}
`;





