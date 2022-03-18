const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
const {log} = require("nodemon/lib/utils");
const app = express();
const port = 8000;

app.use('*', cors());
app.use(express.json({limit:'2mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(db.url,(err, database) => {
  // console.log('data',database);
  // client.db('test');
  if(err) return;
  require('./app/routes')(app, database.db('mentalHealth'));
  app.listen(port, () => {
    console.log('We are live on ' + port);
  })
});