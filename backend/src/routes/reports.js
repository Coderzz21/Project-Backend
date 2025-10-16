import express from 'express';
import csvWriter from 'csv-writer';
import jsPDF from 'jspdf';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Export bookings as CSV
router.get('/bookings/csv', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventId, startDate, endDate } = req.query;
    
    const filter = {};
    if (eventId) filter.eventId = eventId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('eventId', 'title date location price')
      .sort({ createdAt: -1 });

    const csvData = bookings.map(booking => ({
      ticketCode: booking.ticketCode,
      userEmail: booking.userId.email,
      userName: booking.userId.name,
      eventTitle: booking.eventId.title,
      eventDate: booking.eventId.date.toISOString().split('T')[0],
      eventLocation: booking.eventId.location,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.createdAt.toISOString().split('T')[0]
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    
    const createCsvWriter = csvWriter.createObjectCsvStringifier({
      header: [
        { id: 'ticketCode', title: 'Ticket Code' },
        { id: 'userEmail', title: 'User Email' },
        { id: 'userName', title: 'User Name' },
        { id: 'eventTitle', title: 'Event Title' },
        { id: 'eventDate', title: 'Event Date' },
        { id: 'eventLocation', title: 'Event Location' },
        { id: 'seats', title: 'Seats' },
        { id: 'totalAmount', title: 'Total Amount' },
        { id: 'status', title: 'Status' },
        { id: 'paymentStatus', title: 'Payment Status' },
        { id: 'bookingDate', title: 'Booking Date' }
      ]
    });

    const csvString = createCsvWriter.getHeaderString() + createCsvWriter.stringifyRecords(csvData);
    res.send(csvString);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error exporting CSV' });
  }
});

// Get dashboard analytics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Basic stats
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Monthly revenue chart data
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Most popular events
    const popularEvents = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$eventId',
          totalBookings: { $sum: 1 },
          totalSeats: { $sum: '$seats' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' }
    ]);

    // Recent activity
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Category breakdown
    const categoryStats = await Event.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        confirmedBookings,
        totalRevenue
      },
      charts: {
        monthlyRevenue,
        categoryStats
      },
      popularEvents,
      recentBookings
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

export default router;