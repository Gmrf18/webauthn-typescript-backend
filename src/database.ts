
import type { AuthenticatorTransport } from '@simplewebauthn/server/script/deps';

export interface User {
  id: string;
  username: string;
  currentChallenge?: string;
}

export interface Credential {
  id: string;
  publicKey: Uint8Array;
  transports: AuthenticatorTransport[];
  counter: number;
}

const users: User[] = [];
const credentials: Credential[] = [];

export const db = {
  users,
  credentials,
};
