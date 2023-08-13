import mongoose from 'mongoose';

//Definiranje Card sheme
const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  storeName: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  expDate: {
    type: Date,
    required: true,
  },
});

// Create the Card model
const Card = mongoose.model('Card', cardSchema);

export default Card;
