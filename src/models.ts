import mongoose, { Schema, Document } from 'mongoose';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';

// User document definition for Mongoose
export interface IUser extends Document {
  id: Buffer; // Mongoose does not directly support Uint8Array, we use Buffer
  username: string;
  currentChallenge?: string;
}

// Credential document definition for Mongoose
export interface ICredential extends Document {
  id: string;
  userId: Buffer; // Reference to the user
  publicKey: Buffer; // Mongoose does not directly support Uint8Array, we use Buffer
  transports: AuthenticatorTransportFuture[];
  counter?: number;
}

// Esquema de Usuario
const UserSchema: Schema = new Schema({
  id: { type: Buffer, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  currentChallenge: { type: String, required: false }
});

// Esquema de Credencial
const CredentialSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: Buffer, required: true }, // Reference to the user
  publicKey: { type: Buffer, required: true },
  transports: [{ type: String }], // Almacenar transports como strings
  counter: { type: Number, required: false }
});

// Modelos
export const UserModel = mongoose.model<IUser>('User', UserSchema);
export const CredentialModel = mongoose.model<ICredential>('Credential', CredentialSchema);