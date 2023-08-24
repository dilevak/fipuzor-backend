import express from 'express';
import authRoutes from './authRoutes.js';
import cors from 'cors';

const app = express(); // instanciranje aplikacije

const allowedOrigins = ['http://localhost:8080', 'https://fipuzor.netlify.app']; //dodavanje jos origina po potrebi
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
  

//app.use(cors()); // Set up CORS middleware
app.use(express.json()); // Middleware for parsing JSON request bodies
app.use('/api', authRoutes); // Mount the authentication routes

const port = process.env.PORT; // port na kojem će web server slušati

// Global unhandledRejection event handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
  });

app.get('/', (req, res) => res.send('Hello World, ovaj puta preko browsera!'))

app.listen(port, () => console.log(`Slušam na portu ${port}!`))

import { connect } from './db.js';
//import connect from './db.js';