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
  // Obtener todas las credenciales de la base de datos
  const credentials = await db.getAllCredentials();
  
  return await generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials
      .filter(cred => cred?.id !== undefined)
      .map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports
      })),
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
