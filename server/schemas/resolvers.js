const { GraphQLError } = require('graphql');
const { User } = require('../models');
const {signToken}= require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            console.log(context)
            if (context.user) {
                return await User.findOne({ _id: context.user._id });
            }
            throw new GraphQLError('You are not authorized to perform this action.', {
                extensions: {
                    code: 'FORBIDDEN',
                },
            });
        }
    },

    Mutation: {
        login: async (parent, args) => {
            const user = await User.findOne({ $or: [{ username: args.username }, { email: args.email }] });
            if (!user) {
                throw new GraphQLError('User not found!', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            const correctPw = await user.isCorrectPassword(args.password);

            if (!correctPw) {
                throw new GraphQLError('Invalid password!', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);

            if (!user) {
                throw new GraphQLError('Something is wrong!', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            try {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args.book} },
                { new: true, runValidators: true }
              );
              return updatedUser;
            } catch (err) {
              console.log(err);
              throw new GraphQLError('Something is wrong!', {
                extensions: {
                    code: 'BAD_REQUEST',
                },
            });
            }
        },
        removeBook: async (parent, args, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
              );
              if (!updatedUser) {
                throw new GraphQLError('Unable to find user!', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
              }
              return updatedUser;
        }
    }
};

module.exports = resolvers;
