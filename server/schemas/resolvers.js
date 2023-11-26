const { User } = require('../models');

const resolvers = {
  Query: {
    me: async () => {
      return await User.findOne({});
    }
  }
};

module.exports = resolvers;
