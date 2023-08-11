import express from 'express';
import connect from './db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let client; // Deklaracija client varijable
  try {
    console.log('Attempting login for:', username);

    const client = await connect();
    const db = client.db('fipuzor');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ username, password });

    if (user) {
      console.log('Login successful for:', username);
      res.json({ success: true });
    } else {
      console.log('Login failed for:', username);
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('An error occurred while connecting:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

export default router;
