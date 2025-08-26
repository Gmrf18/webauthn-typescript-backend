import mongoose, { Schema, Document } from 'mongoose';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';

// Definición del documento User para Mongoose
export interface IUser extends Document {
  id: Buffer; // Mongoose no soporta Uint8Array directamente, usamos Buffer
  username: string;
  currentChallenge?: string;
}

// Definición del documento Credential para Mongoose
export interface ICredential extends Document {
  id: string;
  publicKey: Buffer; // Mongoose no soporta Uint8Array directamente, usamos Buffer
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
  publicKey: { type: Buffer, required: true },
  transports: [{ type: String }], // Almacenar transports como strings
  counter: { type: Number, required: false }
});

// Modelos
export const UserModel = mongoose.model<IUser>('User', UserSchema);
export const CredentialModel = mongoose.model<ICredential>('Credential', CredentialSchema);