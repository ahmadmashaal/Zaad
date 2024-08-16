import express from 'express';
import cors from 'cors';

const morgan = require('morgan');

require('dotenv').config();


// Create express app
const app = express();

// Apply middlewares
app.use(cors());
app.use(express.json()); //to communicate with frontend with JSON
app.use(morgan("dev"));

// Routes
app.get('/', (req, res) => {
    res.send('you hit server endpoint');
});

// Port
const port = process.env.PORT || 8000;

// Listen
app.listen(port, () => console.log(`Server is running on port ${port}`));