import express from 'express';
import connect from './db.js';
import { createCard } from './cardController.js';
//Bcrypt library za kriptiranje passworda
//import bcrypt from 'bcrypt';
//Bcryptjs library radi problema s bycryptom
//import bcrypt from 'bcryptjs';
const bcryptjs = require('bcryptjs');


import { ObjectId } from 'mongodb'; // Add this import for ObjectId


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
      const isPasswordValid = await bcryptjs.compare(password, user.password);
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
    const hashedPassword = await bcryptjs.hash(password, 10);

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

//Search friends po mailu ruta
router.get('/search-friends/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const client = await connect();
    const db = client.db('fipuzor');
    const usersCollection = db.collection('users');

    const results = await usersCollection.find({ email }).toArray();
    client.close();

    res.json({ success: true, results });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
  }
});

// AddFriend ruta i kreacija nove kolekcije u db
router.post('/add-friend', async (req, res) => {
  const { userID, friendEmail } = req.body;

  try {
    console.log('Adding friend:', userID, friendEmail);

    const client = await connect();
    const db = client.db('fipuzor');
    const friendsCollection = db.collection('friends');
    const usersCollection = db.collection('users');

    //Pronadji frendov ObjectID trayeci po mailu
    const friend = await usersCollection.findOne({ email: friendEmail });
    if (!friend) {
      console.log('Friend not found');
      res.json({ success: false, message: 'Friend not found' });
      return;
    }

    console.log('Friend found:', friend);

    //Dodaj u bazu
    const result = await friendsCollection.insertOne({
      user1: new ObjectId(userID),
      user2: friend._id, //Koristi prondeni ObjectID iz maila
    });

    client.close();

    if (result.acknowledged) {
      console.log('Friend added successfully:', result.insertedId);
      res.json({ success: true, message: 'Friend added successfully' });
    } else {
      console.log('Failed to add friend:', result);
      res.json({ success: false, message: 'Failed to add friend' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
  }
});

  //Ruta za dohvacanje friend liste
  router.get('/friend-list/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const client = await connect();
    const db = client.db('fipuzor');
    const friendsCollection = db.collection('friends');

    const userFriends = await friendsCollection.find({
      $or: [{ user1: new ObjectId(userID) }, { user2: new ObjectId(userID) }],
    }).toArray();

    //Kreiraj array za storanje friend IDs
    const friendIDs = [];

    //Ekstraktanje friend IDs iz userFriends arraya
    userFriends.forEach((friendship) => {
      if (friendship.user1.toString() === userID) {
        friendIDs.push(friendship.user2);
      } else {
        friendIDs.push(friendship.user1);
      }
    });

    //Dohvati detalje prijatelja iz users kolekcije pon friend ID-u
    const usersCollection = db.collection('users');
    const friends = await usersCollection.find({ _id: { $in: friendIDs } }).toArray();

    client.close();

    res.json({ success: true, friends });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
  }
});

//Ruta za share kartice s nekim iz frend liste
router.post('/share-card', async (req, res) => {
  const { username, friendUsername, cardId } = req.body;

  try {
    const client = await connect();
    const db = client.db('fipuzor');
    const usersCollection = db.collection('users');
    const cardsCollection = db.collection('cards');
    const sharedCardsCollection = db.collection('shared_cards');

    const user = await usersCollection.findOne({ username });
    const friend = await usersCollection.findOne({ username: friendUsername });

    if (!user || !friend) {
      res.json({ success: false, message: 'User or friend not found' });
      return;
    }

    // Search for the card using the cardNumber
    console.log('Searching for card with cardNumber:', cardId);
    const card = await cardsCollection.findOne({ cardNumber: cardId });

    //const cardNumberToFind = '12345678';
    //const directQueryCard = await cardsCollection.findOne({ cardNumber: cardNumberToFind });
    //console.log('Card found by direct query:', directQueryCard);

    if (!card) {
      res.json({ success: false, message: 'Card not found' });
     return;
    }
    //Dodaj novu karticu u shared_cards collection
    const sharedCardInfo = {
      userId: user._id,
      friendId: friend._id,
      cardId: card._id, // Use card's ObjectId from the cards collection
    };
    
    const insertionResult = await sharedCardsCollection.insertOne(sharedCardInfo);
    
    client.close();
    
    if (insertionResult.acknowledged && insertionResult.insertedId) {
      res.json({ success: true, message: 'Card shared successfully' });
    } else {
      res.json({ success: false, message: 'Failed to share card' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
    console.error('An error occurred while sharing the card:', error);
    res.json({ success: false, message: 'Failed to share card' });
  }
});

//Ruta za dohvacanje shareanih kartica za logged-in user (trazeci po friendId)
router.get('/shared-cards/:friendId', async (req, res) => {
  const friendId = req.params.friendId;

  try {
    console.log('Fetching shared card details for loggedInUser:', friendId);

    const client = await connect();
    const db = client.db('fipuzor');
    const sharedCardsCollection = db.collection('shared_cards');
    const cardsCollection = db.collection('cards');

    //Pronadji karticu u cards kolekciji
    const sharedCards = await sharedCardsCollection.find({ friendId: new ObjectId(friendId) }).toArray();

    //Ako nema sharanih kartica, odgovori s praznom listom
    if (sharedCards.length === 0) {
      console.log('No shared cards found for friendId:', friendId);
      client.close();
      res.json({ success: true, sharedCards: [] });
      return;
    }

    //Uzmi cardID pronadjene sharane kartice
    const cardIds = sharedCards.map(card => card.cardId);

    console.log('Card IDs to fetch details:', cardIds);

    //Pronadji tu karticu u cards kolekciji
    const cardDetails = await cardsCollection.find({ _id: { $in: cardIds } }).toArray();

    console.log('Card details found:', cardDetails);

    client.close();

    res.json({ success: true, sharedCards: cardDetails });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'An error occurred while connecting' });
  }
});

export default router;
