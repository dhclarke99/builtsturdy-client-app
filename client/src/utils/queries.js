import { gql } from '@apollo/client';

export const QUERY_EXERCISES = gql`
query findAllExercises {
  exercises {
    _id
    name
    notes
    adminNotes
    videoUrl
    tag
  }
}
`;

export const FIND_EXERCISE_BY_ID = gql`
query findExerciseById($exerciseId: ID!) {
  exercise(exerciseId: $exerciseId) {
    _id
    name
    notes
    adminNotes
    videoUrl
    tag
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
    role
    mainPhysiqueGoal
    trainingExperience
    username
    weeks
    caloricTarget
    proteinTarget
    carbohydrateTarget
    fatTarget
    startDate
    mealPlanTemplate
    emailVerificationToken
    schedule {
      _id
      name
      notes
      adminNotes
      type
      workouts {
        day
        workoutId
      }
    }
    dailyTracking {
      date
      calorieIntake
      proteinIntake
      weight
    }
    completedDays{
      date
      completed
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

export const FETCH_ALL_WORKOUTS = gql`
query fetchAllWorkouts {
  workouts {
    _id
    name
    notes
    adminNotes
    exercises {
      exercise {
        _id
        name
        notes
        adminNotes
        videoUrl
        tag
      }
      sets
      targetReps
    }
  }
}
`;

export const FETCH_ALL_USERS = gql`
query findAllUsers {
  users {
    _id
    age
    currentWeight
    email
    firstname
    estimatedBodyFat
    gender
    height
    lastname
    mainPhysiqueGoal
    role
    startDate
    caloricTarget
    proteinTarget
    carbohydrateTarget
    fatTarget
    mealPlanTemplate
    weeks
    schedule {
      _id
      name
      notes
      adminNotes
      type
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
    completedDays{
      date
      completed
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
    adminNotes
    exercises {
      exercise {
        _id
      name
      notes
      adminNotes
      videoUrl
      tag
      }
      sets
      targetReps
      
    }
    
  }
}
`;

export const FETCH_SCHEDULES = gql`
query findSchedules {
  schedules {
    _id
    name
    notes
    adminNotes
    type
    workouts {
      day
      workoutId
    }
  }
}
`;

export const FETCH_SCHEDULE_BY_ID = gql`
query findScheduleById($scheduleId: ID!) {
  schedule(scheduleId: $scheduleId) {
    _id
    name
    notes
    adminNotes
    type
    workouts {
      day
      workoutId
    }
  }
}
`;







