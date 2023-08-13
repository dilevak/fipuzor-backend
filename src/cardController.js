import Card from './models/Card.js';
import mongoose from 'mongoose';

export const createCard = async (req, res) => {
  try {
    const { userId, storeName, cardNumber, expDate } = req.body;

    // Convert userId to ObjectId using mongoose.Types.ObjectId
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const newCard = new Card({
      userId: userIdObjectId,
      storeName,
      cardNumber,
      expDate: new Date(expDate),
    });

    await newCard.save();

    res.status(201).json({ message: 'Card added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};