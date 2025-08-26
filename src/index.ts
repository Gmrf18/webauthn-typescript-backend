import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { getRegistrationOptions, verifyRegistration, getLoginOptions, verifyLogin } from './webauthn';
import { db, type User } from './database';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/server/script/deps';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hola mundo' });
});

app.post('/generate-registration-options', async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user: User = {
    id: `user_${Date.now()}`,
    username,
  };

  db.users.push(user);

  const options = await getRegistrationOptions(user);

  user.currentChallenge = options.challenge;

  res.json(options);
});

app.post('/verify-registration', async (req: Request, res: Response) => {
  const { username, response } = req.body as { username: string; response: RegistrationResponseJSON };

  const user = db.users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.currentChallenge) {
    return res.status(400).json({ error: 'No challenge found for user' });
  }

  try {
    const verification = await verifyRegistration(response, user.currentChallenge);

    if (verification.verified) {
      db.credentials.push({
        id: response.id,
        publicKey: verification.registrationInfo.credentialPublicKey,
        counter: verification.registrationInfo.counter,
        transports: response.response.transports || [],
      });

      user.currentChallenge = undefined;

      return res.json({ verified: true });
    }

    res.status(400).json({ error: 'Verification failed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/generate-login-options', async (req: Request, res: Response) => {
  const { username } = req.body;

  const user = db.users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const options = await getLoginOptions(user);

  user.currentChallenge = options.challenge;

  res.json(options);
});

app.post('/verify-login', async (req: Request, res: Response) => {
  const { username, response } = req.body as { username: string; response: AuthenticationResponseJSON };

  const user = db.users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.currentChallenge) {
    return res.status(400).json({ error: 'No challenge found for user' });
  }

  const credential = db.credentials.find(c => c.id === response.id);

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  try {
    const verification = await verifyLogin(response, credential, user.currentChallenge);

    if (verification.verified) {
      credential.counter = verification.authenticationInfo.newCounter;
      user.currentChallenge = undefined;

      return res.json({ verified: true });
    }

    res.status(400).json({ error: 'Verification failed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
