import { gql } from '@apollo/client';

export const QUERY_EXERCISES = gql`
query findAllExercises {
  exercises {
    _id
    name
    notes
    sets
    reps
    weight
  }
}
`;

export const FIND_EXERCISE_BY_ID = gql `
query findExerciseById($exerciseId: ID!) {
  exercise(exerciseId: $exerciseId) {
    _id
    name
    notes
    sets
    reps
    weight
  }
}
`;

export const QUERY_USER_by_id = gql`
query findUserById($userId: String!) {
  user(id: $userId) {
    _id
    age
    currentWeight
    email
    estimatedBodyFat
    firstname
    gender
    height
    lastname
    mainPhysiqueGoal
    trainingExperience
    username
    schedules {
      _id
      name
      notes
      workouts {
        day
        workoutId
      }
    }
    workouts {
      _id
      name
      notes
      exercises {
        _id
        name
        notes
        reps
        sets
        weight
      }
    }
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
    age
    currentWeight
    email
    estimatedBodyFat
    firstname
    gender
    height
    lastname
    mainPhysiqueGoal
    trainingExperience
    username
    schedules {
      _id
      name
      notes
      workouts {
        day
        workoutId
      }
    }
    workouts {
      _id
      name
      notes
      exercises {
        _id
        name
        notes
        reps
        sets
        weight
      }
    }
  }
}
`;

export const FETCH_WORKOUT_BY_ID = gql`
query findWorkoutById($workoutId: ID!) {
  workout(workoutId: $workoutId) {
    _id
    name
    notes
    exercises {
      _id
      name
      notes
      reps
      sets
    }
    
  }
}
`;

export const FETCH_SCHEDULES = gql `
query findSchedules {
  schedules {
    _id
    name
    notes
    workouts {
      day
      workoutId
    }
  }
}
`;

export const FETCH_SCHEDULE_BY_ID = gql `
query Query($scheduleId: ID!) {
  schedule(scheduleId: $scheduleId) {
    _id
    name
    notes
    workouts {
      day
      workoutId
    }
  }
}
`;





