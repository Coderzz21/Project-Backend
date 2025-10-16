import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: 'booked' });
    const totalEvents = await Event.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();

    // Calculate total revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: 'booked' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get popular events
    const popularEvents = await Booking.aggregate([
      { $match: { status: 'booked' } },
      { 
        $group: { 
          _id: '$event', 
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        } 
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]);

    // Populate event details
    const populatedEvents = await Event.populate(popularEvents, {
      path: '_id',
      select: 'title category date location',
    });

    const formattedEvents = populatedEvents.map((item) => ({
      eventId: item._id._id,
      title: item._id.title,
      category: item._id.category,
      bookings: item.bookings,
      revenue: item.revenue,
    }));

    res.json({
      success: true,
      analytics: {
        totalBookings,
        totalRevenue,
        totalEvents,
        totalUsers,
        popularEvents: formattedEvents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export bookings data
// @route   GET /api/admin/export/:format
// @access  Private/Admin
export const exportBookings = async (req, res) => {
  try {
    const { format } = req.params;

    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title date location price');

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Booking ID,User,Email,Event,Date,Seats,Amount,Status,Created At\n';
      const csvRows = bookings.map((booking) => {
        return [
          booking._id,
          booking.user.name,
          booking.user.email,
          booking.event.title,
          new Date(booking.event.date).toLocaleDateString(),
          booking.seats,
          booking.totalAmount,
          booking.status,
          new Date(booking.createdAt).toLocaleDateString(),
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.header('Content-Type', 'text/csv');
      res.attachment(`bookings-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};