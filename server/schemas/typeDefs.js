const { gql } = require('apollo-server-express');

const typeDefs = gql`


  type User {
    _id: ID
    username: String
    firstname: String
    lastname: String
    email: String
    workouts: [Workout]!
    schedules: [Schedule]
  }

  type Option {
    optionText: String
  }

  type Workout {
    _id: ID
    name: String
    exercises: [Exercise]
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

  type Schedule {
    _id: ID
    userId: ID
    workouts: [ScheduledWorkout]
  }
  
  type ScheduledWorkout {
    workoutId: ID
    day: String
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
    schedules: [Schedule]
    schedule(scheduleId: ID!): Schedule
    me: User
  }

  type Mutation {
    createUser(username: String!, firstname: String!, lastname: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    createExercise(name: String!, sets: Int!, reps: Int!, weight: Float, notes: String): Exercise
    createWorkout(name: String!): Workout
    assignExerciseToWorkout(workoutId: ID!, exerciseId: ID!): Workout 
    deleteExercise(exerciseId: ID!): Exercise
    deleteWorkout(workoutId: ID!): Workout
    deleteSchedule(scheduleId: ID!): Schedule
    updateWorkoutNotes(workoutId: ID!, notes: String!): Workout
    createSchedule(userId: ID!): Schedule
    addWorkoutToSchedule(scheduleId: ID!, workoutId: ID!, day: String!): Schedule
    removeWorkoutFromSchedule(scheduleId: ID!, workoutId: ID!): Schedule
    addScheduleToUser(userId: ID!, scheduleId: ID!): User
    removeScheduleFromUser(userId: ID!, scheduleId: ID!): User
  }

`;

module.exports = typeDefs;
