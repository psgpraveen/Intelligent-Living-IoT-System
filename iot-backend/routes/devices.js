import express from 'express';
import bcrypt from 'bcryptjs';
import Device from '../models/Device.js';
import Appliance from '../models/Appliance.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST - Add device
// POST - Add device (with duplicate check)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { deviceId, name } = req.body;

    const existing = await Device.findOne({
      user: req.user._id,
      deviceId,
      isActive: true,
    });

    if (existing) {
      return res.status(409).json({ message: "Device ID already registered." });
    }

    const dev = await Device.create({ ...req.body, user: req.user._id });
    res.status(201).json(dev);
  } catch (e) {
    next(e);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const list = await Device.find({ user: req.user._id, isActive: true });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// DELETE - Hard delete device and its appliances (with password confirmation)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    console.log(req.body);
    const { password } = req.body;
    
    const { id } = req.params;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const device = await Device.findOne({ _id: id, user: req.user._id });
    if (!device) {
      return res.status(404).json({ message: "Device not found." });
    }

    await Appliance.deleteMany({ deviceId: id });
    await Device.deleteOne({ _id: id });

    res.json({ message: "Device and its appliances permanently deleted." });
  } catch (e) {
    next(e);
  }
});

export default router;
