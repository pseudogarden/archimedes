import { GraphQLDate } from 'graphql-iso-date';

const resolvers = {

  Date: GraphQLDate,
  Query: {
    message: 'Hello World!'
  },
};

module.exports = resolvers;
