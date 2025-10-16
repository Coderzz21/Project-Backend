import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { sendEventReminderEmail, sendWeeklyReport } from './emailService.js';

export const startCronJobs = () => {
  // Send event reminders every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder job...');
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      // Find events happening tomorrow
      const upcomingEvents = await Event.find({
        date: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        isActive: true
      });
      
      for (const event of upcomingEvents) {
        // Find confirmed bookings for this event
        const bookings = await Booking.find({
          eventId: event._id,
          status: 'confirmed',
          reminderSent: false
        }).populate('userId', 'email name');
        
        for (const booking of bookings) {
          await sendEventReminderEmail(booking.userId.email, {
            booking,
            event
          });
          
          // Mark reminder as sent
          booking.reminderSent = true;
          await booking.save();
        }
      }
      
      console.log(`Sent reminders for ${upcomingEvents.length} events`);
    } catch (error) {
      console.error('Error in daily reminder job:', error);
    }
  });
  
  // Send weekly reports every Monday at 8 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log('Running weekly report job...');
    
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Get weekly stats
      const totalBookings = await Booking.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        status: 'confirmed'
      });
      
      const revenueResult = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: oneWeekAgo },
            status: 'confirmed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
      
      const newUsers = await User.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      });
      
      const activeEvents = await Event.countDocuments({
        isActive: true,
        date: { $gte: new Date() }
      });
      
      const reportData = {
        totalBookings,
        totalRevenue,
        newUsers,
        activeEvents
      };
      
      // Send report to all admins
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendWeeklyReport(admin.email, reportData);
      }
      
      console.log('Weekly reports sent to admins');
    } catch (error) {
      console.error('Error in weekly report job:', error);
    }
  });
  
  // Clean up expired bookings every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running booking cleanup job...');
    
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      // Cancel pending bookings older than 1 hour
      const expiredBookings = await Booking.updateMany(
        {
          status: 'pending',
          createdAt: { $lt: oneHourAgo }
        },
        {
          status: 'cancelled'
        }
      );
      
      console.log(`Cancelled ${expiredBookings.modifiedCount} expired bookings`);
    } catch (error) {
      console.error('Error in booking cleanup job:', error);
    }
  });
  
  console.log('✅ Cron jobs started successfully');
};