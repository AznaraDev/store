const app = require('./src/app.js');
const { conn } = require('./src/data');
const { PORT } = require('./src/config/envs.js');
require('dotenv').config();

// Syncing all the models at once.
// IMPORTANTE: alter: false porque usamos migraciones de Sequelize CLI
conn.sync({ alter: true }).then(async () => {
  app.listen(PORT, () => {
    console.log(`🚀 listening on port: ${PORT} 🚀`);
  });
 
});

