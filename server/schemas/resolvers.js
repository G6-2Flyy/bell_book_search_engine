const { User } = require('../models');

const resolvers = {
  Query: {
    classes: async () => {
      return await Class.find({});
    }
  }
};

module.exports = resolvers;
