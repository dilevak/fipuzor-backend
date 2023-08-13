import Card from './models/Card.js';

export const createCard = async (req, res) => {
  try {
    const { userId, storeName, cardNumber, expDate } = req.body;

    const newCard = new Card({
      userId,
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