import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON
} from '@simplewebauthn/server'

import { db, User } from './database'

// Exportar los tipos para que puedan ser usados en otros archivos
export type { AuthenticationResponseJSON, RegistrationResponseJSON };

export const rpName = 'SimpleWebAuthn Example'
export const rpID = 'localhost'
export const origin = `http://${rpID}:4200`

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
  const credentialsAwait = await db.getCredentialsByUserId(user.id);
  const credentials = credentialsAwait
    .filter(cred => cred.id !== undefined)
    .map(cred => {
      return {
        id: cred.id,
        type: 'public-key',
        transports: cred.transports
      }
    })
  return await generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials,
    userVerification: 'preferred'
  })
}

export async function verifyLogin(response: AuthenticationResponseJSON, credential: any, expectedChallenge: string): Promise<VerifiedAuthenticationResponse> {
  console.log('verificacion')
  return await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: credential // Cambiado de 'authenticator' a 'credential'
  })
}
