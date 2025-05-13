// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  githubToken?: string; // Add this
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, default: null },
  avatarUrl: { type: String, default: null },
  githubToken: { type: String, default: null }, // Store GitHub token
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);