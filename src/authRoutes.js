import express from 'express';
import connect from './db.js';
import { createCard } from './cardController.js';
//Bcrypt library za kriptiranje passworda
import bcrypt from 'bcrypt';


const router = express.Router();

//AddCard ruta
router.post('/cards', async (req, res) => {
  const { userID, name, cardNumber, expireDate, logo } = req.body;

  try {
    console.log('Received request to add card:', req.body);

    const client = await connect();
    const db = client.db('fipuzor');

    //Provjera ako "cards" collection postoji
    const collections = await db.listCollections({ name: 'cards' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('cards');
    }

    const cardsCollection = db.collection('cards');

    const newCard = {
      userID,
      name,
      cardNumber,
      expireDate,
      logo,
    };

    const result = await cardsCollection.insertOne(newCard);
    client.close();

    if (result.insertedCount === 1) {
      console.log('Card added successfully:', result.insertedId);
      res.json({ success: true, message: 'Card added successfully' });
    } else {
      console.log('Card added but response marked as failed');
      res.json({ success: true, message: 'Card added but response marked as failed' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting', error: error.message });
  }
});

//Ruta za dohvacanje kartica po userID-u

router.get('/cards/:userID', async (req, res) => {
  const userID = req.params.userID;

  try {
    const client = await connect();
    const db = client.db('fipuzor');
    const cardsCollection = db.collection('cards');

    // Find all cards associated with the userID
    const cards = await cardsCollection.find({ userID }).toArray();
    client.close();

    res.json({ success: true, cards });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
  }
});

//Login ruta
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let client;

  try {
    console.log('Attempting login for:', username);

    const client = await connect();
    const db = client.db('fipuzor');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ username });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        console.log('Login successful for:', username);
        res.json({ success: true, userID: user._id, username: user.username });
      } else {
        console.log('Login failed for:', username);
        res.json({ success: false, message: 'Invalid credentials' });
      }
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = {
      username,
      email,
      password: hashedPassword,
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
