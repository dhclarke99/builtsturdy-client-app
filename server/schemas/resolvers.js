const { AuthenticationError } = require('apollo-server-express');
const { User, Workout, Exercise, Schedule} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async (_parent, _args, context) => {
      // console.log("Inside users resolver - Start");
      // console.log("Context:", context)
      // console.log("Context.user:", context.user)
      // console.log("Context.user.role:", context.role)
      // console.log("Debugging context.user:", JSON.stringify(context.user, null, 2));
      // console.log("Debugging context.user.role:", context.user.role);
      // console.log("Debugging typeof context.user.role:", typeof context.user.role);
      if (context.user.role !== 'Admin') {
        console.log("Context.user:", context.user)
        console.log("Context.user.role:", context.user.role)
        throw new AuthenticationError('You are not authorized to access this resource.');
        
      }
      console.log("Context.user:", context.user)
        console.log("Context.user.role:", context.user.role)
      return await User.find().populate('schedule');
    },
    user: async (_parent, { id }) => {
      return await User.findOne({ _id:  id }).populate('workouts').populate('schedule');
    },
    workouts: async (_parent, _args, context) => {
      // console.log("Inside workouts resolver - Start");
      // console.log("Context:", context)
      // console.log("Context.user:", context.user)
      // console.log("Context.user.role:", context.role)
      // console.log("Debugging context.user:", JSON.stringify(context.user, null, 2));
      // console.log("Debugging context.user.role:", context.user.role);
      // console.log("Debugging typeof context.user.role:", typeof context.user.role);
      if (context.user.role !== 'Admin') {
        throw new AuthenticationError('You are not authorized to access this resource.');
      }
      return await Workout.find().populate("exercises");
  
    },
    workout: async (_parent, { workoutId }) => {
      return await Workout.findOne({ _id: workoutId }).populate('exercises');
    },
    exercises: async () => {
      // console.log("Inside exercises resolver - Start");
      return await Exercise.find();
    },
    exercise: async (_, { exerciseId }) => {
      return await Exercise.findById(exerciseId);
    },
    schedules: async (_parent, _args, context) => {
      // console.log("Inside schedules resolver - Start");
      // console.log("Context:", context)
      // console.log("Context.user:", context.user)
      // console.log("Context.user.role:", context.role)
      // console.log("Debugging context.user:", JSON.stringify(context.user, null, 2));
      // console.log("Debugging context.user.role:", context.user.role);
      // console.log("Debugging typeof context.user.role:", typeof context.user.role);
      if (context.user.role !== 'Admin') {
        throw new AuthenticationError('You are not authorized to access this resource.');
      }
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
    createUser: async (_parent, { input }) => {
      try {
        const { username, firstname, lastname, email, password, role, gender, height, currentWeight, estimatedBodyFat, age, trainingExperience, mainPhysiqueGoal, startDate, weeks } = input;
        const user = await User.create({
          username,
          firstname,
          lastname,
          email,
          password,
          role,
          gender,
          height,
          currentWeight,
          estimatedBodyFat,
          age,
          trainingExperience,
          mainPhysiqueGoal,
          startDate,
          weeks
        });
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.log(err);
        throw new Error('Failed to create user');
      }
    },
    updateUser: async (_, { userId, input }) => {
      try {
        // Filter out any fields that are null or undefined
        const updateFields = Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value != null)
        );
        console.log(updateFields)
        // Find the user by ID and update it
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateFields },
          { new: true, runValidators: true }
        );
        console.log(updatedUser)
  
        // If the user doesn't exist, throw an error
        if (!updatedUser) {
          throw new Error('User not found');
        }
  
        return updatedUser;
      } catch (error) {
        console.error("Error in updateUser:", error);
        throw new Error("Failed to update user");
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
    logout: (_, __, context) => {
      // If using cookies
      context.res.clearCookie('token');
      
      // Additional server-side logic if needed
      
      return true;
    },
    createExercise: async (_, { name, sets, reps, weight, notes, adminNotes, videoURL }) => {
      try {
        return await Exercise.create({ name, sets, reps, weight, notes, adminNotes, videoURL });
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
    deleteExercise: async (_, { exerciseId }) => {
      try {
        return await Exercise.findByIdAndDelete(exerciseId);
        
      } catch (error) {
        console.error("Error in removeExercise:", error);
        throw new Error("Failed to remove exercise");
      }
    },

    deleteWorkout: async (_, { workoutId }) => {
      try {
        return await Workout.findByIdAndDelete(workoutId);
      } catch (error) {
        console.error("Error in removeWorkout:", error);
        throw new Error("Failed to remove workout");
      }
    },
    deleteUser: async (_, { userId }) => {
      try {
        return await User.findByIdAndDelete(userId);
      } catch (error) {
        console.error("Error in deleteUser:", error);
        throw new Error("Failed to delete User");
      }
    },
    deleteSchedule: async (_, { scheduleId }) => {
      try {
        return await Schedule.findByIdAndDelete(scheduleId);
      } catch (error) {
        console.error("Error in removeSchedule:", error);
        throw new Error("Failed to remove schedule");
      }
    },
    updateWorkout: async (_, { workoutId, name, notes, exerciseIds }) => {
      const updateFields = {};
      if (name !== null && name !== undefined) {
        updateFields.name = name;
      }
      if (notes !== null && notes !== undefined) {
        updateFields.notes = notes;
      }
      if (exerciseIds !== null && exerciseIds !== undefined) {
        updateFields.exercises = exerciseIds;
      }

      return await Workout.findByIdAndUpdate(workoutId, updateFields, { new: true }).populate('exercises');
    },
    updateSchedule: async (_, { scheduleId, input }) => {
      // Find the schedule by ID and update it
      const updatedSchedule = await Schedule.findByIdAndUpdate(
        scheduleId,
        { $set: input },
        { new: true, runValidators: true }
      );

      // If the schedule doesn't exist, throw an error
      if (!updatedSchedule) {
        throw new Error('Schedule not found');
      }

      return updatedSchedule;
    },
  
    updateExercise: async (_, { exerciseId, input }) => {
      try {
        // Filter out any fields that are null or undefined
        const updateFields = Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value != null)
        );
        console.log(updateFields)
        // Find the user by ID and update it
        const updatedExercise = await Exercise.findByIdAndUpdate(
          exerciseId,
          { $set: updateFields },
          { new: true, runValidators: true }
        );
        console.log(updatedExercise)
  
        // If the user doesn't exist, throw an error
        if (!updatedExercise) {
          throw new Error('Exercise not found');
        }
  
        return updatedExercise;
      } catch (error) {
        console.error("Error in updateExercise:", error);
        throw new Error("Failed to update exercise");
      }
    },
    createSchedule: async (_, { name }) => {
      try {
        // Create a new schedule
        const newSchedule = await Schedule.create({ name });
        
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
    removeWorkoutFromSchedule: async (_, { scheduleId, workoutId }) => {
      try {
        // Find the schedule by scheduleId
        const schedule = await Schedule.findById(scheduleId);

        if (!schedule) {
          throw new Error('Schedule not found');
        }

        // Remove the workout from the schedule's workouts array
        schedule.workouts = schedule.workouts.filter(workout => workout.workoutId.toString() !== workoutId);

        // Save the updated schedule
        await schedule.save();

        return schedule;

      } catch (error) {
        console.error("Error in removeWorkoutFromSchedule:", error);
        throw new Error("Failed to remove workout from schedule");
      }
    },
   
  },
};

module.exports = resolvers;

