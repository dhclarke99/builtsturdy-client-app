const { AuthenticationError } = require('apollo-server-express');
const { User, Workout, Exercise} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return await User.find().populate('workouts');
    },
    user: async (_parent, { userId }) => {
      return await User.findOne({ userId }).populate('workouts');
    },
    workouts: async () => {
      return await Workout.find().populate("exercises");
  
    },
    workout: async (_parent, { workoutId }) => {
      return await Workout.findOne({ _id: workoutId }.populate('exercises'))
    },
    exercises: async () => {
      return await Exercise.find();
    },
    exercise: async (_, { exerciseId }) => {
      return await Exercise.findById(exerciseId);
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
    createWorkout: async (_, { name, exercises }) => {
      try {
        return await Workout.create({ name, exercises });
      } catch (error) {
        console.error("Error in createWorkout:", error);
        throw new Error("Failed to create workout");
      }
    },
        
  },
};

module.exports = resolvers;

