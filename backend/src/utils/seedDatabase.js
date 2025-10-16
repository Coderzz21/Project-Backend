import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();

    console.log('📝 Data cleared');

    // Create admin user (plain password; User model pre-save will hash it)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventhub.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create regular user (plain password; User model pre-save will hash it)
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user',
    });

    console.log('✅ Users created');

    // Create sample events
    const events = await Event.insertMany([
      {
        title: 'Tech Conference 2025',
        description: 'Join industry leaders for the biggest tech conference of the year.',
        date: new Date('2025-03-15T09:00:00'),
        location: 'San Francisco, CA',
        capacity: 500,
        price: 299,
        category: 'Technology',
        imageUrl: 'https://images.pexels.com/photos/1552617/pexels-photo-1552617.jpeg',
        status: 'active',
        createdBy: admin._id,
      },
      {
        title: 'Music Festival Summer',
        description: 'Three days of amazing music and entertainment.',
        date: new Date('2025-07-20T18:00:00'),
        location: 'Austin, TX',
        capacity: 1000,
        price: 199,
        category: 'Music',
        imageUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
        status: 'active',
        createdBy: admin._id,
      },
      {
        title: 'Business Summit',
        description: 'Network with entrepreneurs and business leaders.',
        date: new Date('2025-04-10T08:00:00'),
        location: 'New York, NY',
        capacity: 300,
        price: 399,
        category: 'Business',
        imageUrl: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
        status: 'active',
        createdBy: admin._id,
      },
      {
        title: 'Art Exhibition',
        description: 'Contemporary art from emerging artists.',
        date: new Date('2025-05-05T10:00:00'),
        location: 'Los Angeles, CA',
        capacity: 200,
        price: 49,
        category: 'Arts',
        imageUrl: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg',
        status: 'active',
        createdBy: admin._id,
      },
    ]);

    console.log('✅ Events created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Admin Login:');
    console.log('Email: admin@eventhub.com');
    console.log('Password: admin123');
    console.log('\n📧 User Login:');
    console.log('Email: john@example.com');
    console.log('Password: user123');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();