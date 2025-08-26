import 'dotenv/config'; // Cargar variables de entorno al inicio
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { getRegistrationOptions, verifyRegistration, getLoginOptions, verifyLogin } from './webauthn';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/server';
import { db, type User } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
(async () => {
  try {
    await db.initialize();
    console.log('-> Base de datos inicializada');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1); // Salir si no se puede conectar a la base de datos
  }
})();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hola mundo' });
});

app.post('/generate-registration-options', async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Crear un nuevo usuario en MongoDB
  const userId = new Uint8Array(Buffer.from(`user_${Date.now()}`));
  const newUser: User = {
    id: userId,
    username,
  };

  try {
    const user = await db.createUser(newUser);
    
    const options = await getRegistrationOptions(user);
    
    // Actualizar el desafío del usuario
    await db.updateUserChallenge(userId, options.challenge);
    
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-registration', async (req: Request, res: Response) => {
  const { username, response } = req.body as { username: string; response: RegistrationResponseJSON };

  // Buscar usuario en MongoDB
  const user = await db.findUserByUsername(username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.currentChallenge) {
    return res.status(400).json({ error: 'No challenge found for user' });
  }

  try {
    const verification = await verifyRegistration(response, user.currentChallenge);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      
      // Guardar credencial en MongoDB
      await db.createCredential({
        id: response.id,
        publicKey: credential.publicKey, // Corregido
        counter: credential.counter, // Corregido
        transports: response.response.transports || [],
      });

      // Limpiar el desafío del usuario
      await db.updateUserChallenge(user.id, '');

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

  // Buscar usuario en MongoDB
  const user = await db.findUserByUsername(username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const options = await getLoginOptions(user);
    
    // Actualizar el desafío del usuario
    await db.updateUserChallenge(user.id, options.challenge);
    
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-login', async (req: Request, res: Response) => {
  const { username, response } = req.body as { username: string; response: AuthenticationResponseJSON };

  // Buscar usuario en MongoDB
  const user = await db.findUserByUsername(username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.currentChallenge) {
    return res.status(400).json({ error: 'No challenge found for user' });
  }

  // Buscar credencial en MongoDB
  const credential = await db.findCredentialById(response.id);

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  try {
    const verification = await verifyLogin(response, credential, user.currentChallenge);

    if (verification.verified && verification.authenticationInfo) {
      // Actualizar el contador de la credencial
      await db.updateCredentialCounter(credential.id, verification.authenticationInfo.newCounter);
      
      // Limpiar el desafío del usuario
      await db.updateUserChallenge(user.id, '');

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
