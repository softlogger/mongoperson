const express = require('express');
const path = require('path');
const sql = require('mssql');
const bodyParser = require('body-parser');
const config = require('./config');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoClient = new MongoClient(config.mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
mongoClient.connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
  });

// Connect to SQL Server
sql.connect(config.sqlConfig)
  .then(pool => {
    if (pool.connected) {
      console.log('Connected to SQL Server');
    }
  })
  .catch(err => console.error('Failed to connect to SQL Server', err));

// CRUD Routes for Person
app.get('/persons', async (req, res) => {
  try {
    const pool = await sql.connect(config.sqlConfig);
    const result = await pool.request().query('SELECT Person_Id, FirstName, LastName FROM Person');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching persons');
  }
});

app.post('/persons', async (req, res) => {
  const { firstName, lastName } = req.body;
  try {
    const pool = await sql.connect(config.sqlConfig);
    await pool.request()
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .query('INSERT INTO Person (FirstName, LastName) VALUES (@firstName, @lastName)');

    const db = mongoClient.db('logs');
    await db.collection('transactions').insertOne({
      operation: 'CREATE',
      data: { firstName, lastName },
      timestamp: new Date()
    });

    res.status(201).send('Person added');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding person');
  }
});

app.put('/persons/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;
  try {
    const pool = await sql.connect(config.sqlConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .query('UPDATE Person SET FirstName = @firstName, LastName = @lastName WHERE Person_Id = @id');

    const db = mongoClient.db('logs');
    await db.collection('transactions').insertOne({
      operation: 'UPDATE',
      data: { id, firstName, lastName },
      timestamp: new Date()
    });

    res.send('Person updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating person');
  }
});

app.delete('/persons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config.sqlConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Person WHERE Person_Id = @id');

    const db = mongoClient.db('logs');
    await db.collection('transactions').insertOne({
      operation: 'DELETE',
      data: { id },
      timestamp: new Date()
    });

    res.send('Person deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting person');
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
