import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date'],
    },
    location: {
      type: String,
      required: [true, 'Please provide event location'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide event capacity'],
      min: 1,
    },
    price: {
      type: Number,
      required: [true, 'Please provide event price'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide event category'],
      enum: [
        'Technology',
        'Music',
        'Business',
        'Arts',
        'Sports',
        'Food',
        'conference',
        'workshop',
        'concert',
        'sports',
        'festival',
        'seminar',
        'other',
      ],
    },
    imageUrl: {
      type: String,
      default: 'https://images.pexels.com/photos/1552617/pexels-photo-1552617.jpeg',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available seats
eventSchema.virtual('availableSeats').get(function () {
  return this.capacity - this.bookings.length;
});

const Event = mongoose.model('Event', eventSchema);

export default Event;