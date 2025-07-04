import express from 'express';
import Device from '../models/Device.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add device
router.post('/', authenticate, async (req, res, next) => {
  try {
    const dev = await Device.create({ ...req.body, user: req.user._id });
    res.status(201).json(dev);
  } catch (e) { next(e); }
});

// User's devices
router.get('/', authenticate, async (req, res, next) => {
  try {
    const list = await Device.find({ user: req.user._id, isActive: true });
    res.json(list);
  } catch (e) { next(e); }
});

export default router;
