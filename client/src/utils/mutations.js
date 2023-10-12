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

export const LOGOUT_USER = gql `
mutation logout {
  logout
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

export const CREATE_USER = gql`
mutation createUser($input: CreateUserInput!) {
  createUser(input: $input) {
    token
    user {
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
      role
      schedule {
        _id
        name
        notes
        workouts {
          day
          workoutId
        }
      }
      trainingExperience
      username
      dailyTracking {
        calorieIntake
        date
        proteinIntake
        weight
      }
    }
  }
}

     
`;

export const UPDATE_USER = gql `
mutation updateUser($userId: ID!, $input: UpdateUserInput!) {
  updateUser(userId: $userId, input: $input) {
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
    schedule {
      _id
      name
      notes
      workouts {
        day
        workoutId
      }
    }
    dailyTracking {
      calorieIntake
      date
      proteinIntake
      weight
    }
  }
}
`;


export const CREATE_EXERCISE = gql`
mutation Mutation($name: String!, $notes: String, $adminNotes: String, $videoUrl: String, $tag: String) {
  createExercise(name: $name, notes: $notes, adminNotes: $adminNotes, videoUrl: $videoUrl, tag: $tag) {
    name
    notes
    adminNotes
    videoUrl
    tag
  }
}
`;

export const UPDATE_EXERCISE = gql `
mutation updateExercise($exerciseId: ID!, $input: updateExerciseInput!) {
  updateExercise(exerciseId: $exerciseId, input: $input) {
    _id
    name
    notes
    videoUrl
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

export const UPDATE_WORKOUT = gql `
mutation updateWorkoutDetails($workoutId: ID!, $input: UpdateWorkoutDetailsInput!) {
  updateWorkout(workoutId: $workoutId, input: $input) {
    _id
    name
    notes
    exercises {
      exercise {
        _id
        adminNotes
        name
        notes
        videoUrl
      }
      sets
      targetReps
    }
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
    }
    name
    notes
  }
}
`;

export const CREATE_SCHEDULE =  gql `
mutation createSchedule($name: String!) {
  createSchedule(name: $name) {
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

export const UPDATE_SCHEDULE = gql `
mutation updateSchedule($scheduleId: ID!, $input: UpdateScheduleInput!) {
  updateSchedule(scheduleId: $scheduleId, input: $input) {
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

export const DELETE_USER = gql `
mutation deleteUser($userId: ID!) {
  deleteUser(userId: $userId) {
    _id
    firstname
    email
    username
    role
  }
}
`;

export const DELETE_SCHEDULE = gql `
mutation deleteSchedule($scheduleId: ID!) {
  deleteSchedule(scheduleId: $scheduleId) {
    _id
  }
}`

export const DELETE_EXERCISE = gql `
mutation deleteExercise($exerciseId: ID!) {
  deleteExercise(exerciseId: $exerciseId) {
    _id
    name
    notes
  }
}
`;

export const ADD_DAILY_TRACKING = gql `
mutation addDailyTracking($userId: ID!, $trackingData: [DailyTrackingInput!]!) {
  addDailyTracking(userId: $userId, trackingData: $trackingData) {
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
    role
    startDate
    trainingExperience
    username
    weeks
    dailyTracking {
      calorieIntake
      date
      proteinIntake
      weight
    }
  }
}
`

export const UPDATE_USER_COMPLETION = gql `
mutation updateUserCompletion($userId: ID!, $input: CompletedDaysInput!) {
  updateUserCompletion(userId: $userId, input: $input) {
    _id
    firstname
    email
    completedDays {
      date
      completed
    }
  }
}
`;

export const LOG_COMPLETED_WORKOUT = gql `
mutation logCompletedWorkout($userId: ID!, $date: String!, $workouts: [CompletedWorkoutInput!]!) {
  logCompletedWorkout(userId: $userId, date: $date, workouts: $workouts) {
    _id
    completedDays {
      completed
      date
      workout {
        exerciseName
        sets {
          actualReps
          weight
        }
      }
    }
  }
}
`;

export const UPDATE_USER_MEAL_PLAN_TEMPLATE = gql `
mutation updateUserMealPlanTemplate($userId: ID!, $mealPlanTemplate: String!) {
  updateUserMealTemplate(userId: $userId, mealPlanTemplate: $mealPlanTemplate) {
    _id
    firstname
    lastname
    mealPlanTemplate
  }
}
`;