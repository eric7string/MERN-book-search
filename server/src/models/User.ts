import { Schema, model, type Document, type Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Import schema and type from Book.js
import bookSchema, { BookDocument } from './Book';

// Define the User Document interface
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[];
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number; // Virtual field
}

// Define the User Model interface (if needed for static methods)
export interface UserModel extends Model<UserDocument> {}

// Define the User Schema
const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    // Set savedBooks to adhere to the bookSchema
    savedBooks: [bookSchema],
  },
  {
    toJSON: {
      virtuals: true, // Include virtual fields in JSON responses
    },
    toObject: {
      virtuals: true, // Include virtual fields in Object responses
    },
  }
);

// Hash user password before saving
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// Custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Virtual field: Count of saved books
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

// Create and export the User model
const User = model<UserDocument, UserModel>('User', userSchema);

export default User;
