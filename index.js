const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const opn = require('opn');
const initAPI = require('./helpers/InitAPI');
const initORM = require('./helpers/InitORM');

const appReady = async function(){
    // Middlewares
    app.use(bodyParser.json({limit: "50mb"}));
    app.use(fileUpload());
    app.use(cors());
    app.use(express.static('public'));
    // Data layer
    const knex = await initORM(); // knex is instance of simple ORM for sqlite
    const state = await initAPI(app, knex); // bind API routes
    // API init
    app.listen(8080);
    // Open in browser
    console.log('Server is ready at http://localhost:8080/');
    opn('http://localhost:8080/');
}
appReady();