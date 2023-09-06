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
    createUser: async (_parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
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
          throw new AuthenticationError('Invalid email or password');
        }
        const correctPassword = await user.isCorrectPassword(password);
        if (!correctPassword) {
          throw new AuthenticationError('Invalid email or password');
        }
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.log(err);
        throw new Error('Failed to login');
      }
    },
    createExercise: async (_, { name, sets, reps, weight, notes }) => {
      return await Exercise.create({ name, sets, reps, weight, notes });
    },
    createWorkout: async (_, { name, exercises, date }) => {
      return await Workout.create({ name, exercises, date });
    },    
  },
};

module.exports = resolvers;

