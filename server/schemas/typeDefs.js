const { gql } = require('apollo-server-express');

const typeDefs = gql`


  type User {
    _id: ID
    username: String
    firstname: String
    lastname: String
    email: String
    workouts: [Workout]!
  }

  type Option {
    optionText: String
  }

  type Workout {
    _id: ID
    name: String
    exercises: [Exercise]!
    notes: String
    
  }

  type Exercise {
    _id: ID
    name: String
    sets: Int
    reps: Int
    weight: Float
    notes: String
  }

  type Auth {
    token: ID!
    user: User
  }

  input ExerciseInput {
    name: String!
    sets: Int!
    reps: Int!
    weight: Float
    notes: String
  }

  type Query {
    users: [User]
    user(id: String!): User
    workouts: [Workout]
    workout(workoutId: ID!): Workout
    exercises: [Exercise]
    exercise(exerciseId: ID!): Exercise
    me: User
  }

  type Mutation {
    createUser(username: String!, firstname: String!, lastname: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    createExercise(name: String!, sets: Int!, reps: Int!, weight: Float, notes: String): Exercise
    createWorkout(name: String!, exercises: [ExerciseInput]!): Workout
    removeExercise(exerciseId: ID!): Exercise
    removeWorkout(workoutId: ID!): Workout
  }
`;

module.exports = typeDefs;
