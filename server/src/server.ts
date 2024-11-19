import express, { Express, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'path';
import { json } from 'body-parser';

import { typeDefs, resolvers } from './schemas'; // Adjust paths as needed
import db from './config/connection';
import { Context } from './types/context'; // Import the custom context type

const PORT = process.env.PORT || 3001;
const app: Express = express();

// Initialize Apollo Server with custom Context type
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  // Middleware for parsing JSON
  app.use(json());

  // Attach Apollo middleware with custom context
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        // Extract token and perform authentication here
        const user = req.headers.authorization
          ? { _id: '123', email: 'test@example.com', username: 'TestUser' } // Mock or real user
          : undefined;

        return { req, user: user ?? { _id: '', email: '', username: '' } }; // Ensure user is never undefined
      },
    })
  );

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // MongoDB connection error handling
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  // Start the server
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer().catch((error) => {
  console.error('Error starting the server:', error);
});
