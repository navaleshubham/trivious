require('dotenv').config();
const mongoose = require('mongoose');
connectDatabase = async () => {
    mongoose.Promise = global.Promise;
    mongoose.set('useCreateIndex', true);
    mongoose.connection.on('connected', () => {
        console.info("Connected to cluster");
    });
    mongoose.connection.on('error', (err) => {
        console.error(err);
        throw err;
    });
    await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
}

module.exports = { connectDatabase };