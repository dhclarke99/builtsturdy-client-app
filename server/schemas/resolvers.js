const { AuthenticationError } = require('apollo-server-express');
const { User, Workout, Exercise, Schedule} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return await User.find().populate('workouts').populate('schedules');
    },
    user: async (_parent, { id }) => {
      return await User.findOne({ _id:  id }).populate('workouts').populate('schedules');
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
    createUser: async (_parent, { input }) => {
      try {
        const { username, firstname, lastname, email, password, role, gender, height, currentWeight, estimatedBodyFat, age, trainingExperience, mainPhysiqueGoal } = input;
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
          mainPhysiqueGoal
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
  
        // Find the user by ID and update it
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateFields },
          { new: true, runValidators: true }
        );
  
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
  
    updateExercise: async (_, { exerciseId, name, sets, reps, weight, notes }) => {
      const updateFields = {};
      if (name !== null && name !== undefined) {
        updateFields.name = name;
      }
      if (sets !== null && sets !== undefined) {
        updateFields.sets = sets;
      }
      if (reps !== null && reps !== undefined) {
        updateFields.reps = reps;
      }
      if (weight !== null && weight !== undefined) {
        updateFields.weight = weight;
      }
      if (notes !== null && notes !== undefined) {
        updateFields.notes = notes;
      }

      return await Exercise.findByIdAndUpdate(exerciseId, updateFields, { new: true });
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
    addScheduleToUser: async (_, { userId, scheduleId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        user.schedules.push(scheduleId);
        await user.save();
        return user;
      } catch (error) {
        console.error("Error in addScheduleToUser:", error);
        throw new Error("Failed to add schedule to user");
      }
    },
    removeScheduleFromUser: async (_, { userId, scheduleId }) => {
      try {
        // Find the user by userId and update them to remove the schedule
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $pull: { schedules: scheduleId } },
          { new: true }
        ).populate('schedules');

        if (!updatedUser) {
          throw new Error('User not found');
        }

        return updatedUser;

      } catch (error) {
        console.error("Error in removeScheduleFromUser:", error);
        throw new Error("Failed to remove schedule from user");
      }
    },
  },
};

module.exports = resolvers;

