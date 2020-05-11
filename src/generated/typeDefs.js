import { gql } from 'apollo-server-express';

const typeDefs = gql`
scalar Date

  type Query {
    message: String,
  }

  type Mutation {}
`;

module.exports = typeDefs;
