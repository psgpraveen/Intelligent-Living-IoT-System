import express from 'express';
import mongoose from 'mongoose';
import Appliance from '../models/Appliance.js';
import ApplianceHistory from '../models/ApplianceHistory.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 🔹 Create appliance
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, type, device, powerRating = 0 } = req.body;

    if (!name || !type || !device)
      return res.status(400).json({ message: 'Name, type, and device are required.' });

    if (!mongoose.Types.ObjectId.isValid(device))
      return res.status(400).json({ message: 'Invalid device ID format.' });

    const appliance = await Appliance.create({ name, type, device, powerRating });
    res.status(201).json(appliance);
  } catch (e) {
    next(e);
  }
});

// 🔹 List appliances
router.get('/', authenticate, async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.deviceId) filter.device = req.query.deviceId;
    const appliances = await Appliance.find(filter);
    res.json(appliances);
  } catch (e) {
    next(e);
  }
});

// 🔹 Update appliance
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, type, powerRating } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (powerRating !== undefined) updates.powerRating = powerRating;

    const appliance = await Appliance.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!appliance) return res.status(404).json({ message: 'Appliance not found' });

    res.json(appliance);
  } catch (e) {
    next(e);
  }
});

// 🔹 Hard delete appliance
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const deleted = await Appliance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Appliance not found or already deleted' });
    res.json({ message: 'Appliance permanently deleted' });
  } catch (e) {
    next(e);
  }
});

// 🔹 Control appliance (ON/OFF) & track billing
router.post('/:id/control', authenticate, async (req, res, next) => {
  try {
    const { action, ratePerKWh = 8 } = req.body;
    const appliance = await Appliance.findById(req.params.id);
    if (!appliance) return res.status(404).json({ message: 'Appliance not found' });

    const now = new Date();

    if (action === 'turn_on' && appliance.currentStatus === 'OFF') {
      appliance.lastOnAt = now;
      appliance.currentStatus = 'ON';
    }

    else if (action === 'turn_off' && appliance.currentStatus === 'ON') {
      const lastSessionStart = appliance.lastOnAt;
      const elapsedMs = now - lastSessionStart;
      const elapsedHours = elapsedMs / 3600000;

      const avgWatt = appliance.powerRating || 0;
      const deltaEnergyWh = elapsedHours * avgWatt;
      const deltaBill = +(deltaEnergyWh / 1000 * ratePerKWh).toFixed(2);

      // Update appliance
      appliance.totalRunMs += elapsedMs;
      appliance.totalEnergyWh += deltaEnergyWh;
      appliance.lastOnAt = null;
      appliance.currentStatus = 'OFF';

      // Create a history record
      await ApplianceHistory.create({
        appliance: appliance._id,
        totalRunMs: appliance.totalRunMs,
        totalEnergyWh: appliance.totalEnergyWh,
        sessionRunMs: elapsedMs,
        sessionEnergyWh: deltaEnergyWh,
        computedBill: deltaBill,
        timestamp: now
      });
    }

    await appliance.save();

    const totalHours = appliance.totalRunMs / 3600000;
    const totalKWh = appliance.totalEnergyWh / 1000;
    const bill = +(totalKWh * ratePerKWh).toFixed(2);

    res.json({
      status: appliance.currentStatus,
      totalRunMs: appliance.totalRunMs,
      totalHours: +totalHours.toFixed(3),
      totalKWh: +totalKWh.toFixed(3),
      bill
    });
  } catch (e) {
    console.error("Error in /control:", e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});


// 🔹 Reset appliance energy + runtime
router.post('/:id/reset-time', authenticate, async (req, res, next) => {
  try {
    const appliance = await Appliance.findById(req.params.id);
    if (!appliance) return res.status(404).json({ message: 'Appliance not found' });

    appliance.totalRunMs = 0;
    appliance.totalEnergyWh = 0;
    appliance.lastOnAt = appliance.currentStatus === 'ON' ? new Date() : null;

    await appliance.save();
    res.json({ message: 'Reset complete', totalRunMs: 0, totalEnergyWh: 0 });
  } catch (e) {
    next(e);
  }
});

// 🔹 Update appliance power thresholds
router.post('/:id/thresholds', authenticate, async (req, res, next) => {
  try {
    const { low, high } = req.body;

    if (typeof low !== 'number' || typeof high !== 'number') {
      return res.status(400).json({ message: 'Invalid thresholds' });
    }

    const updated = await Appliance.findByIdAndUpdate(
      req.params.id,
      { powerThresholdLow: low, powerThresholdHigh: high },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Appliance not found' });

    res.json({
      message: 'Thresholds updated',
      thresholds: {
        low: updated.powerThresholdLow,
        high: updated.powerThresholdHigh
      }
    });
  } catch (e) {
    next(e);
  }
});

// 🔹 Get usage history
router.get('/:id/history', authenticate, async (req, res, next) => {
  try {
    const history = await ApplianceHistory.find({ appliance: req.params.id })
      .sort({ timestamp: -1 })
      .limit(30);
    res.json(history);
  } catch (e) {
    next(e);
  }
});

export default router;
