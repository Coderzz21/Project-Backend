import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to EventHub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Welcome to EventHub, ${name}!</h2>
          <p>Thank you for joining our community. You can now browse and book amazing events.</p>
          <p>Start exploring events now: <a href="${process.env.CLIENT_URL}/events">Browse Events</a></p>
          <p>Best regards,<br>The EventHub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendBookingConfirmationEmail = async (email, { booking, event, ticketPDF, qrCode }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmation - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Booking Confirmed!</h2>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Seats:</strong> ${booking.seats}</p>
            <p><strong>Total Amount:</strong> $${booking.totalAmount}</p>
            <p><strong>Ticket Code:</strong> ${booking.ticketCode}</p>
          </div>
          <p>Your ticket and QR code are attached to this email.</p>
          <p>Please bring your ticket (digital or printed) to the event.</p>
          <p>Best regards,<br>The EventHub Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${booking.ticketCode}.pdf`,
          content: ticketPDF,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

export const sendEventReminderEmail = async (email, { booking, event }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Reminder: ${event.title} Tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Event Reminder</h2>
          <p>Don't forget about your upcoming event tomorrow!</p>
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(event.date).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Your Seats:</strong> ${booking.seats}</p>
            <p><strong>Ticket Code:</strong> ${booking.ticketCode}</p>
          </div>
          <p>Make sure to arrive 30 minutes before the event starts.</p>
          <p>See you there!<br>The EventHub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Event reminder email sent successfully');
  } catch (error) {
    console.error('Error sending event reminder email:', error);
  }
};

export const sendWeeklyReport = async (adminEmail, reportData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: 'EventHub Weekly Sales Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366F1;">Weekly Sales Report</h2>
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Total Bookings This Week:</strong> ${reportData.totalBookings}</p>
            <p><strong>Total Revenue:</strong> $${reportData.totalRevenue}</p>
            <p><strong>New Users:</strong> ${reportData.newUsers}</p>
            <p><strong>Active Events:</strong> ${reportData.activeEvents}</p>
          </div>
          <p>For detailed analytics, visit your admin dashboard.</p>
          <p>Best regards,<br>The EventHub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Weekly report email sent successfully');
  } catch (error) {
    console.error('Error sending weekly report email:', error);
  }
};