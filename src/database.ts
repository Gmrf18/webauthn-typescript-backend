
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';
import { connectToDatabase } from './mongodb';
import { UserModel, CredentialModel, IUser, ICredential } from './models';
import mongoose from 'mongoose';

// Asegurarse de que la conexión a la base de datos esté establecida
const initializeDb = async () => {
  await connectToDatabase();
};

// Adaptadores para convertir entre tipos de datos (Uint8Array <-> Buffer)
const uint8ArrayToBuffer = (uint8Array: Uint8Array): Buffer => {
  return Buffer.from(uint8Array);
};

const bufferToUint8Array = (buffer: Buffer): Uint8Array => {
  return new Uint8Array(buffer);
};

// Definiciones de interfaces actualizadas (si es necesario mantenerlas)
export interface User {
  id: Uint8Array<ArrayBufferLike>;
  username: string;
  currentChallenge?: string;
}

export interface Credential {
  id: string;
  publicKey: Uint8Array;
  transports: AuthenticatorTransportFuture[];
  counter?: number;
}

// Funciones para interactuar con la base de datos MongoDB
export const db = {
  initialize: initializeDb,

  // Operaciones con Usuarios
  createUser: async (user: Omit<User, 'id'> & { id: Uint8Array }): Promise<User> => {
    await initializeDb();
    const newUser = new UserModel({
      ...user,
      id: uint8ArrayToBuffer(user.id)
    });
    const savedUser = await newUser.save();
    return {
      ...savedUser.toObject(),
      id: bufferToUint8Array(savedUser.id as Buffer)
    } as User;
  },

  findUserByUsername: async (username: string): Promise<User | null> => {
    await initializeDb();
    const user = await UserModel.findOne({ username }).exec();
    if (!user) return null;
    return {
      ...user.toObject(),
      id: bufferToUint8Array(user.id as Buffer)
    } as User;
  },

  findUserById: async (id: Uint8Array): Promise<User | null> => {
    await initializeDb();
    const user = await UserModel.findOne({ id: uint8ArrayToBuffer(id) }).exec();
    if (!user) return null;
    return {
      ...user.toObject(),
      id: bufferToUint8Array(user.id as Buffer)
    } as User;
  },

  updateUserChallenge: async (userId: Uint8Array, challenge: string): Promise<User | null> => {
    await initializeDb();
    const user = await UserModel.findOneAndUpdate(
      { id: uint8ArrayToBuffer(userId) },
      { currentChallenge: challenge },
      { new: true } // Devuelve el documento actualizado
    ).exec();
    if (!user) return null;
    return {
      ...user.toObject(),
      id: bufferToUint8Array(user.id as Buffer)
    } as User;
  },

  // Operaciones con Credenciales
  createCredential: async (credential: Omit<Credential, 'id'> & { id: string }): Promise<Credential> => {
    await initializeDb();
    const newCredential = new CredentialModel({
      ...credential,
      publicKey: uint8ArrayToBuffer(credential.publicKey)
    });
    const savedCredential = await newCredential.save();
    return {
      ...savedCredential.toObject(),
      publicKey: bufferToUint8Array(savedCredential.publicKey as Buffer)
    } as Credential;
  },

  findCredentialById: async (id: string): Promise<Credential | null> => {
    await initializeDb();
    const credential = await CredentialModel.findById(id).exec();
    if (!credential) return null;
    return {
      ...credential.toObject(),
      publicKey: bufferToUint8Array(credential.publicKey as Buffer)
    } as Credential;
  },

  updateCredentialCounter: async (id: string, newCounter: number): Promise<Credential | null> => {
    await initializeDb();
    const credential = await CredentialModel.findByIdAndUpdate(
      id,
      { counter: newCounter },
      { new: true } // Devuelve el documento actualizado
    ).exec();
    if (!credential) return null;
    return {
      ...credential.toObject(),
      publicKey: bufferToUint8Array(credential.publicKey as Buffer)
    } as Credential;
  },
  
  // Obtener todas las credenciales (para usar en getLoginOptions)
  getAllCredentials: async (): Promise<Credential[]> => {
    await initializeDb();
    const credentials = await CredentialModel.find({}).exec();
    return credentials.map(cred => ({
      ...cred.toObject(),
      publicKey: bufferToUint8Array(cred.publicKey as Buffer)
    })) as Credential[];
  }
};
