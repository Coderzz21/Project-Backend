import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seats: {
      type: Number,
      required: [true, 'Please specify number of seats'],
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed'],
      default: 'booked',
    },
    ticketCode: {
      type: String,
      unique: true,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique ticket code before saving
bookingSchema.pre('save', function (next) {
  if (!this.ticketCode) {
    this.ticketCode = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;