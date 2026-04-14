const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

async function connectDatabase(uri = mongoUri) {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  const opts = {
    serverSelectionTimeoutMS: 8000,
  };
  await mongoose.connect(uri, opts);
  if (nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  }
}

module.exports = { connectDatabase };
