const { gql } = require('apollo-server-express');

const typeDefs = gql`


type User {
  _id: ID
  username: String
  firstname: String
  lastname: String
  email: String
  schedule: Schedule
  gender: String
  role: String
  height: Int
  currentWeight: Float
  estimatedBodyFat: Float
  age: Int
  trainingExperience: String
  mainPhysiqueGoal: String
  startDate: String
  weeks: Int
  dailyTracking: [DailyTracking]
  completedDays: [CompletedDays]
}

input CreateUserInput {
  username: String!
  firstname: String!
  lastname: String!
  email: String!
  password: String!
  role: String!
  gender: String
  height: Int
  currentWeight: Float
  estimatedBodyFat: Float
  age: Int
  trainingExperience: String
  mainPhysiqueGoal: String
  startDate: String!
  weeks: Int!
}

input UpdateUserInput {
  username: String
  firstname: String
  lastname: String
  email: String
  password: String
  role: String
  gender: String
  height: Int
  currentWeight: Float
  estimatedBodyFat: Float
  age: Int
  trainingExperience: String
  mainPhysiqueGoal: String
  schedule: ID
  startDate: String
  weeks: Int
  dailyTracking: [DailyTrackingInput!]

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
    adminNotes: String
    videoUrl: String
  }

  type Schedule {
    _id: ID
    name: String
    notes: String
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
    adminNotes: String
    videoUrl: String
  }

  input updateExerciseInput {
    name: String
    sets: Int
    reps: Int
    weight: Float
    notes: String
    adminNotes: String
    videoUrl: String
  }

  input UpdateWorkoutInput {
    workoutId: ID
    day: String
  }
  
  input UpdateScheduleInput {
    name: String
    notes: String
    workouts: [UpdateWorkoutInput]
  }

  input DailyTrackingInput {
    date: String!
    weight: Float
    calorieIntake: Float
    proteinIntake: Float
  }

  type DailyTracking {
    date: String
    weight: Float
    calorieIntake: Float
    proteinIntake: Float
  }

  input CompletedDaysInput{
    date: String!
    completed: Boolean
  }

  type CompletedDays {
    date: String
    completed: Boolean
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
    createUser(input: CreateUserInput!): Auth
    updateUser(userId: ID!, input: UpdateUserInput!): User
    updateUserCompletion(userId: ID!, input: CompletedDaysInput): User
    deleteUser(userId: ID!): User
    login(email: String!, password: String!): Auth
    logout: Boolean
    createExercise(name: String!, sets: Int, reps: Int, weight: Float, notes: String, videoURL: String): Exercise
    updateExercise(exerciseId: ID!, input: updateExerciseInput!): Exercise
    createWorkout(name: String!): Workout
    deleteExercise(exerciseId: ID!): Exercise
    deleteWorkout(workoutId: ID!): Workout
    deleteSchedule(scheduleId: ID!): Schedule
    createSchedule(name: String!): Schedule
    addWorkoutToSchedule(scheduleId: ID!, workoutId: ID!, day: String!): Schedule
    removeWorkoutFromSchedule(scheduleId: ID!, workoutId: ID!): Schedule
    updateWorkout(workoutId: ID!, name: String, notes: String, exerciseIds: [ID]): Workout
    updateSchedule(scheduleId: ID!, input: UpdateScheduleInput!): Schedule
    addDailyTracking(userId: ID!, trackingData: [DailyTrackingInput!]!): User
    }
    
  

`;

module.exports = typeDefs;
