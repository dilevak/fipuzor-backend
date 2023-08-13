import express from 'express';
import connect from './db.js';
import { createCard } from './cardController.js';


const router = express.Router();

//AddCard ruta
router.post('/addcard', (req, res) => {
  console.log('Received a request to add a card:', req.body); // Log the request body
  createCard(req, res); // Delegate the request handling to your createCard function
});

//Login ruta
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

//Signup routa
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  let client;

  try {
    console.log('Attempting signup for:', username);

    const client = await connect();
    const db = client.db('fipuzor');
    const usersCollection = db.collection('users');

    // Check if username or email already exists in the database
    const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('Username or email already exists:', username, email);
      res.json({ success: false, message: 'Username or email already exists' });
      return;
    }

    // Create a new user document
    const newUser = {
      username,
      email,
      password,
    };

    // Insert the new user into the database
    await usersCollection.insertOne(newUser);

    console.log('Signup successful for:', username);
    res.json({ success: true });
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
