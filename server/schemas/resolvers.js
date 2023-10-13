const { AuthenticationError } = require('apollo-server-express');
const { User, Workout, Exercise, Schedule} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async (_parent, _args, context) => {
      if (context.user.role !== 'Admin') {
        throw new AuthenticationError('You are not authorized to access this resource.'); 
      }

      return await User.find().populate('schedule');
    },
    user: async (_parent, { id }) => {
     
      return await User.findOne({ _id:  id }).populate('schedule');
    },
    workouts: async (_parent, _args, context) => {
    
      if (context.user.role !== 'Admin') {
        throw new AuthenticationError('You are not authorized to access this resource.');
      }
      return await Workout.find().populate("exercises.exercise");
  
    },
    workout: async (_parent, { workoutId }, context) => {
      // console.log("workouts resolver starting")
      // console.log("context user role: ", context.user.role)
      // if (context.user.role !== 'Admin') {
      //   throw new AuthenticationError('You are not authorized to access this resource.');
      // }
      return await Workout.findOne({ _id: workoutId }).populate('exercises.exercise');
    },
    exercises: async () => {
      return await Exercise.find();
    },
    exercise: async (_, { exerciseId }) => {
      return await Exercise.findById(exerciseId);
    },
    schedules: async (_parent, _args, context) => {
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
        await user.save(); 
        // user = await User.findById(user._id).select('+emailVerificationToken')
        const token = signToken(user);
        console.log(token, user)
        return {
          token,
          user: {
            ...user._doc,
            emailVerificationToken: user.emailVerificationToken
          }
        }
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
          { 
            new: true, 
            runValidators: true, 
            context: 'query'  // This ensures that the pre-save middleware runs
          }
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
    updateUserMealTemplate: async (_, { userId, mealPlanTemplate }) => {
      console.log(mealPlanTemplate)
      try {
        // Filter out any fields that are null or undefined
      
        // Find the user by ID and update it
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: {mealPlanTemplate: mealPlanTemplate} },
          { 
            new: true, 
            runValidators: true, 
          }
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
    createExercise: async (_, { name, notes, adminNotes, videoUrl, tag }) => {
      try {
        console.log(name, notes, adminNotes, videoUrl, tag )
        return await Exercise.create({ name, notes, adminNotes, videoUrl, tag });
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
    updateWorkout: async (_, { workoutId, input }) => {
      const { name, notes, adminNotes, exercises } = input;
      const updateFields = {};
    
      if (name) updateFields.name = name;
      if (notes) updateFields.notes = notes;
      if (adminNotes) updateFields.adminNotes = adminNotes;
      if (exercises) updateFields.exercises = exercises.map(ex => ({
        exercise: ex.exercise,
        sets: ex.sets,
        targetReps: ex.targetReps
      }));
    
      return await Workout.findByIdAndUpdate(workoutId, updateFields, { new: true }).populate('exercises.exercise');
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
 
    addDailyTracking: async (_, { userId, trackingData }, context) => {
      try {
        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
          throw new Error('User not found');
        }

        // Replace the existing dailyTracking array with the new trackingData array
        user.dailyTracking = trackingData;

        // Save the updated user data
        await user.save();

        return user;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to update daily tracking');
      }
    },
    updateUserCompletion: async (parent, { userId, input }, context) => {
      try {
        const user = await User.findById(userId);
    
        if (!user) {
          throw new Error('User not found');
        }
    
        // Convert Unix timestamp to ISO string
    const inputDateIsoString = new Date(parseInt(input.date)).toISOString();

    // Find the index of the object that has the specified date
    const index = user.completedDays.findIndex(day => day.date.toISOString() === inputDateIsoString);
        console.log("input date: ", input.date)
        console.log("User Completed Days: ", user.completedDays)
        console.log("index: ", index)
        if (index === -1) {
          // If the object doesn't exist, throw an error
          throw new Error('Specified date not found in completedDays');
        } else {
          // If the object exists, update its 'completed' field
          user.completedDays[index].completed = input.completed;
        }
    
        await user.save();
    
        return user;
      } catch (error) {
        console.error(error);
        throw new Error('Something went wrong');
      }
    },
    logCompletedWorkout: async (parent, { userId, date, workouts }, context) => {
      // Find the user
      const user = await User.findById(userId);
      
      // Find the specific day in completedDays
      const day = user.completedDays.find(d => d.date.toISOString() === new Date(date).toISOString());
      
      if (day) {
        workouts.forEach(workout => {
          // Find the specific exercise in the workout array
          const exercise = day.workout.find(e => e.exerciseName === workout.exerciseName);
          
          if (exercise) {
            // Update the existing exercise
            exercise.sets = workout.sets;
          } else {
            // Push the new exercise
            day.workout.push(workout);
          }
        });
        
        // Save the updated user document
        await user.save();
        
        return user;
      } else {
        // Handle the case where the day does not exist
        // ...
        throw new Error("Day does not exist!")
      }
    },
    changePassword: async (_, { userId, oldPassword, newPassword }) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
  
      const isCorrect = await user.isCorrectPassword(oldPassword);
      if (!isCorrect) {
        throw new Error('Incorrect old password');
      }
  
      user.password = newPassword;
      await user.save();
  
      return true;
    },
  },
};

module.exports = resolvers;

