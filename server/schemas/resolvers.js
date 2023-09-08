const { AuthenticationError } = require('apollo-server-express');
const { User, Workout, Exercise, Schedule} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return await User.find().populate('workouts').populate('schedules');
    },
    user: async (_parent, { userId }) => {
      return await User.findOne({ userId }).populate('workouts').populate('schedules');
    },
    workouts: async () => {
      return await Workout.find().populate("exercises");
  
    },
    workout: async (_parent, { workoutId }) => {
      return await Workout.findOne({ _id: workoutId }).populate('exercises');
    },
    exercises: async () => {
      return await Exercise.find();
    },
    exercise: async (_, { exerciseId }) => {
      return await Exercise.findById(exerciseId);
    },
    schedules: async () => {
      return await Schedule.find();
    },
    schedule: async (_, { scheduleId }) => {
      return await Schedule.findById(scheduleId);
    },
    me: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('un Authenticated');
      }
        try {
          console.log(context.user._id)
        return await User.findOne({ _id: context.user._id });
        
        
      } catch (error) {
        console.log(error)

      }
    },

  },
  Mutation: {
    createUser: async (_parent, { username, firstname, lastname, email, password }) => {
      try {
        const user = await User.create({ username, firstname, lastname, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.log(err);
        throw new Error('Failed to create user');
      }
    },
    login: async (_parent, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError('Invalid email');
        }
        

        const correctPassword = await user.isCorrectPassword(password);

        

        if (!correctPassword) {
          throw new AuthenticationError('Invalid password');
        }
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.log(err);
        throw new Error('Failed to login');
      }
    },
    createExercise: async (_, { name, sets, reps, weight, notes }) => {
      try {
        return await Exercise.create({ name, sets, reps, weight, notes });
      } catch (error) {
        console.error("Error in createExercise:", error);
        throw new Error("Failed to create exercise");
      }
    },
    createWorkout: async (_, { name }) => {
      try {
        return await Workout.create({ name });
      } catch (error) {
        console.error("Error in createWorkout:", error);
        throw new Error("Failed to create workout");
      }
    },
    assignExerciseToWorkout: async (_, { workoutId, exerciseId }) => {
      try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
          throw new Error('Workout not found');
        }
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
          throw new Error('Exercise not found');
        }
        workout.exercises.push(exercise);
        await workout.save();
        return workout;
      } catch (error) {
        console.error("Error in assignExerciseToWorkout:", error);
        throw new Error("Failed to assign exercise to workout");
      }
    },
    removeExercise: async (_, { exerciseId }) => {
      try {
        return await Exercise.findByIdAndDelete(exerciseId);
        
      } catch (error) {
        console.error("Error in removeExercise:", error);
        throw new Error("Failed to remove exercise");
      }
    },

    removeWorkout: async (_, { workoutId }) => {
      try {
        return await Workout.findByIdAndDelete(workoutId);
      } catch (error) {
        console.error("Error in removeWorkout:", error);
        throw new Error("Failed to remove workout");
      }
    },
    removeSchedule: async (_, { scheduleId }) => {
      try {
        return await Schedule.findByIdAndDelete(scheduleId);
      } catch (error) {
        console.error("Error in removeSchedule:", error);
        throw new Error("Failed to remove schedule");
      }
    },
    updateWorkoutNotes: async (_, { workoutId, notes }) => {
      try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
          throw new Error('Workout not found');
        }
        workout.notes = notes;
        await workout.save();
        return workout;
      } catch (error) {
        console.error("Error in updateWorkoutNotes:", error);
        throw new Error("Failed to update workout notes");
      }
    },
    createSchedule: async (_, { userId }) => {
      try {
        // Create a new schedule
        const newSchedule = await Schedule.create({ userId });

        // Find the user by userId and update them to include the new schedule
        await User.findByIdAndUpdate(
          userId,
          { $push: { schedules: newSchedule._id } },
          { new: true }
        );

        return newSchedule;

      } catch (error) {
        console.error("Error in createSchedule:", error);
        throw new Error("Failed to create schedule");
      }
    },
    addWorkoutToSchedule: async (_, { scheduleId, workoutId, day }) => {
      try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
          throw new Error('Schedule not found');
        }
        schedule.workouts.push({ workoutId, day });
        await schedule.save();
        return schedule;
      } catch (error) {
        console.error("Error in addWorkoutToSchedule:", error);
        throw new Error("Failed to add workout to schedule");
      }
    },  
  },
};

module.exports = resolvers;

