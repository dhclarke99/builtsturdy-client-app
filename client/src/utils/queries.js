import { gql } from '@apollo/client';

export const QUERY_EXERCISES = gql`
query Query {
    exercises {
      name
      reps
      sets
      weight
      notes
    }
  }
`;
export const QUERY_USER = gql`
query Query($username: String!) {
  user(username: $username) {
    eggplants
  }
}
`;

export const QUERY_USER_by_id = gql`
query Query($userId: String!) {
  user(id: $userId) {
    eggplants
    _id
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
  query Query {
    users {
      _id
      email
      firstname
      lastname
      username
      workouts {
        name
      }
    }
  }
`;






