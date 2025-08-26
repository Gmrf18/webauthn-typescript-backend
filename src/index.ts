import 'dotenv/config' // Load environment variables at the beginning
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { getLoginOptions, getRegistrationOptions, verifyLogin, verifyRegistration } from './webauthn'
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server'
import { db, type User } from './database'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json());

// Initialize database connection
(async () => {
  try {
    await db.initialize()
    console.log('-> Database initialized')
  } catch (error) {
    console.error('Error initializing the database:', error)
    process.exit(1) // Exit if you cannot connect to the database
  }
})()

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({message: 'Hello World'})
})

app.post('/generate-registration-options', async (req: Request, res: Response) => {
  const {username} = req.body

  if (!username) {
    return res.status(400).json({error: 'Username is required'})
  }

  // Crear un nuevo usuario en MongoDB
  const userId = new Uint8Array(Buffer.from(`user_${Date.now()}`))
  const newUser: User = {
    id: userId,
    username
  }

  try {
    const user = await db.createUser(newUser)

    const options = await getRegistrationOptions(user)

    // Actualizar el desafío del usuario
    await db.updateUserChallenge(userId, options.challenge)

    res.json(options)
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
})

app.post('/verify-registration', async (req: Request, res: Response) => {
  const {username, response} = req.body as { username: string; response: RegistrationResponseJSON }

  const user = await db.findUserByUsername(username)

  if (!user) {
    return res.status(404).json({error: 'User not found'})
  }

  if (!user.currentChallenge) {
    return res.status(400).json({error: 'No challenge found for user'})
  }

  try {
    const verification = await verifyRegistration(response, user.currentChallenge)

    if (verification.verified && verification.registrationInfo) {
      const {credential} = verification.registrationInfo

      await db.createCredential({
        id: response.id,
        userId: user.id, // Associate credential with user
        publicKey: credential.publicKey, // Corregido
        counter: credential.counter, // Corregido
        transports: response.response.transports || []
      })

      await db.updateUserChallenge(user.id, '')

      return res.json({verified: true})
    }

    res.status(400).json({error: 'Verification failed'})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
})

app.post('/generate-login-options', async (req: Request, res: Response) => {
  const {username} = req.body

  const user = await db.findUserByUsername(username)

  if (!user) {
    return res.status(404).json({error: 'User not found'})
  }

  try {
    const options = await getLoginOptions(user)

    await db.updateUserChallenge(user.id, options.challenge)
    res.json(options)
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
})

app.post('/verify-login', async (req: Request, res: Response) => {
  const {username, response} = req.body as { username: string; response: AuthenticationResponseJSON }
  const user = await db.findUserByUsername(username)

  if (!user) {
    return res.status(404).json({error: 'User not found'})
  }

  if (!user.currentChallenge) {
    return res.status(400).json({error: 'No challenge found for user'})
  }

  const credential = await db.findCredentialById(response.id)

  if (!credential) {
    return res.status(404).json({error: 'Credential not found'})
  }

  try {
    const verification = await verifyLogin(response, credential, user.currentChallenge)

    if (verification.verified && verification.authenticationInfo) {
      await db.updateCredentialCounter(credential.id, verification.authenticationInfo.newCounter)

      await db.updateUserChallenge(user.id, '')

      return res.json({verified: true})
    }

    res.status(400).json({error: 'Verification failed'})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
