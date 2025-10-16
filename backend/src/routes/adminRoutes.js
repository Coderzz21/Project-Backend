import express from 'express';
import {
  getAnalytics,
  getAllBookings,
  getAllUsers,
  exportBookings,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/analytics', getAnalytics);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.get('/export/:format', exportBookings);

export default router;