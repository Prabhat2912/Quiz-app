const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain a minimum of 2 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
    bufferMaxEntries: 0,
    bufferCommands: false
})

const connectionDb = mongoose.connection

connectionDb.on('error', (error) => {
    console.log('Database connection error:', error);
})

connectionDb.on('connected', () => {
    console.log("Connected to Database successfully.")
})

connectionDb.on('disconnected', () => {
    console.log('Database disconnected');
});

module.exports = connectionDb