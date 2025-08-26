import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server'
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse
} from '@simplewebauthn/server/script/deps'
import { Credential, db, User } from './database'

export const rpName = 'SimpleWebAuthn Example'
export const rpID = 'localhost'
export const origin = `http://${rpID}:3001`

export async function getRegistrationOptions(user: User) {
  return await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.username,
    attestationType: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred'
    }
  })
}

export async function verifyRegistration(response: RegistrationResponseJSON, expectedChallenge: string): Promise<VerifiedRegistrationResponse> {
  return await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID
  })
}

export async function getLoginOptions(user: User) {
  return await generateAuthenticationOptions({
    rpID,
    allowCredentials: db.credentials.map(cred => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports
    })),
    userVerification: 'preferred'
  })
}

export async function verifyLogin(response: AuthenticationResponseJSON, credential: Credential, expectedChallenge: string): Promise<VerifiedAuthenticationResponse> {
  return await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: credential
  })
}
