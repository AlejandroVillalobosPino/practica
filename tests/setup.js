import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export const connectDB = async () => {
    if (process.env.MONGO_URI && process.env.NODE_ENV === 'test' && process.env.CI) {
        await mongoose.connect(process.env.MONGO_URI);
    } else {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    }
};

export const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
};

export const closeDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
};