import User, { UserDocument } from '../models/User';
import { signToken } from '../services/auth';

interface SaveBookArgs {
  input: {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
  };
}
import { AuthenticationError } from 'apollo-server-express';

interface RemoveBookArgs {
  bookId: string;
}

interface Context {
  user?: {
    _id: string;
  } | null;
}

interface LoginArgs {
  username?: string;
  email: string;
  password: string;
}

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user || !context.user._id) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const user = await User.findById(context.user._id).populate('savedBooks');
      if (!user) {
        throw new AuthenticationError('User not found!');
      }
      return user;
    },
  },

  Mutation: {
    login: async (_: unknown, { email, password }: LoginArgs) => {
      const user = (await User.findOne({ email })) as UserDocument | null;

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user.username, user.email, (user._id as unknown as string).toString());
      return { token, user };
    },

    addUser: async (_: unknown, { username, email, password }: LoginArgs) => {
      const user = (await User.create({ username, email, password })) as UserDocument;

      const token = signToken(user.username, user.email, (user._id as string).toString());
      return { token, user };
    },

    saveBook: async (_: unknown, { input }: SaveBookArgs, context: Context) => {
      if (!context.user || !context.user._id) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: input } },
        { new: true, runValidators: true }
      ).populate('savedBooks');

      if (!updatedUser) {
        throw new AuthenticationError('User not found!');
      }
      return updatedUser;
    },

    removeBook: async (_: unknown, { bookId }: RemoveBookArgs, context: Context) => {
      if (!context.user || !context.user._id) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate('savedBooks');

      if (!updatedUser) {
        throw new AuthenticationError('User not found!');
      }
      return updatedUser;
    },
  },
};

export default resolvers;
