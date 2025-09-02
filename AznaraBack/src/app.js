const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
const bodyParser = require('body-parser');

const { passport, initialize } = require('./passport');
const { JWT_SECRET_KEY, FRONTEND_URL } = require('./config/envs');
const path = require('path');


const app = express();

// Configuración de CORS apropiada para deployment
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://store-sable-two.vercel.app', // ✅ Dominio de Vercel
    FRONTEND_URL // ✅ Variable de entorno
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: `${JWT_SECRET_KEY}`,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/', routes);
app.use(passport.initialize());

app.use('*', (req, res, next) => {
  res.status(404).send({
    error: true,
    message: 'Not found',
  });
});

app.use((err, req, res, netx) => {
  res.status(err.statusCode || 500).send({
    error: true,
    message: err.message,
  });
});

module.exports = app;