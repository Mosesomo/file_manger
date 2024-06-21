const express = require('express');
const bodyParser = require('body-parser');
const connectDb = require('./utils/db');
const dotenv = require('dotenv').config();
const route = require('./routes/index');


app = express();

connectDb();

app.use(express.json());
app.use('/api', route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server listening on port: ${PORT}`);
})
