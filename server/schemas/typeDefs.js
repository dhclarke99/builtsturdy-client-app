const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  type User {
    _id: ID
    username: String
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
    date: Date
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
    createUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    createExercise(name: String!, sets: Int!, reps: Int!, weight: Float, notes: String): Exercise
    createWorkout(name: String!, exercises: [ExerciseInput]!, date: Date): Workout
  }
`;

module.exports = typeDefs;
