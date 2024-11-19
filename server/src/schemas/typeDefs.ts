import { gql } from 'apollo-server-express';

const typeDefs = gql`
  # User type
  type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }

  # Book type
  type Book {
    bookId: ID
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  # Auth type
  type Auth {
    token: String
    user: User
  }

  # Queries
  type Query {
    me: User
  }

  # Mutations
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(input: BookInput!): User
    removeBook(bookId: ID!): User
  }

  # Input type for saving books
  input BookInput {
    bookId: ID!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }
`;

export default typeDefs;
