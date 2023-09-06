const { AuthenticationError } = require('apollo-server-express');
const { User} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return await User.find();
    },
    user: async (_parent, { userId }) => {
      return await User.findOne({ userId });
    },
    // polls: async () => {
    //   return await Poll.find().populate("votes");
    // },
    // poll: async (_parent, { pollId }) => {
    //   return await Poll.findOne({ _id: pollId })
    // },
    me: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('un Authenticated');
      }
        try {
          console.log(context.user._id)
        return await User.findOne({ _id: context.user._id });
        
        // return await User.findOne({ _id: "64778d30cdb4befbb37a1479" }).populate('polls');
      } catch (error) {
        console.log(error)

      }
    },
    // votes: async () => {
    //   return await Vote.find();
    // },

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
    // createPoll: async (_parent, { title, description, value, option1, option2 }, context) => {
    //   if (!context.user) {
    //     throw new AuthenticationError('un Authenticated');
    //   }
    //   try {
    //     const user = await User.findById(context.user._id);
    //     const poll = await Poll.create({ title, description, creator: user._id, value, option1, option2 });
    //     user.polls.push(poll);
    //     await user.save();
    //     return poll;
    //   } catch (err) {
    //     console.log(err);
    //     throw new Error('Failed to create poll');
    //   }
    // },
    // removePoll: async (_parent, { pollId }, context) => {
    //   if (!context.user) {
    //     throw new AuthenticationError('Not Authenticated');
    //   }
    //   try {
    //     const user = await User.findById(context.user._id);
    //     const poll = await Poll.findById(pollId);
    //     if (!poll) {
    //       throw new Error('Poll not found');
    //     }
    //     if (poll.creator.toString() !== user._id.toString()) {
    //       throw new AuthenticationError('Not authorized to remove this poll');
    //     }
    //     await poll.remove();
    //     user.polls.pull(pollId);
    //     await user.save();
    //     return poll;
    //   } catch (err) {
    //     console.log(err);
    //     throw new Error('Failed to remove poll');
    //   }
    // },
    // createVote: async (_parent, { pollId, option1, option2 }, _context) => {
    //   try {
    //     const user = await User.findById("6478b09999183cc2ae6569b6");
    //     const poll = await Poll.findOne({ _id: pollId });
    //     if (!poll) {
    //       throw new Error('Poll not found');
    //     }

    
    //     const vote = await Vote.create({ poll: poll._id, user: "6478b09999183cc2ae6569b6", option1: option1, option2: option2 });
    
    //     // Add the vote reference to the poll's votes array
    //     poll.votes.push(vote._id);
    //     await poll.save();
    
    //     // Update the poll with vote count logic
    //     const updateObj = {};
    //     if (option1) {
    //       updateObj.option1Votes = (poll.option1Votes || 0) + 1;
    //     }
    //     if (option2) {
    //       updateObj.option2Votes = (poll.option2Votes || 0) + 1;
    //     }
    //     await Poll.updateOne({ _id: pollId }, { $inc: updateObj });
    

    //     return vote;
    //   } catch (err) {
    //     console.log(err);
    //     throw new Error('Failed to create vote');
    //   }
    // },
  
    
    // updateUser: async (_parent, {userId, eggplants}, _context,) => {
    //   try {
    //     console.log(userId, eggplants)
    //     const user = await User.findByIdAndUpdate(
    //       userId,
    //       {eggplants},
    //       {new: true}
    //     );

    //     console.log(`Updated eggplants count for user ${user.username}: ${user.eggplants}`)
  
    //     // console.log(`Eggplants rewarded to user ${user.username}`);
    //     return user;
    //   } catch (err) {
    //     console.log(err);
    //     throw new Error('Failed to update user');
    //   }
    // },
    // updatePoll: async (_parent, { pollId, title }, _context) => {
    //   try {
    //     const updatedPoll = await Poll.findByIdAndUpdate(pollId, { title }, { new: true });
    //     return updatedPoll;
    //   } catch (err) {
    //     console.log(err);
    //     throw new Error('Failed to update poll');
    //   }
    //},
  },
};

module.exports = resolvers;

