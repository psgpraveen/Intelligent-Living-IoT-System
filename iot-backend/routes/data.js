// routes/data.js

import express from 'express';
import mongoose from 'mongoose';
import ApplianceData from '../models/ApplianceData.js';
import Appliance from '../models/Appliance.js';
import Device from '../models/Device.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/data
 * Inserts a new power reading for an appliance.
 * Body: { appliance?: ObjectId, deviceId?: string, voltage: number, current: number, power: number, status: string, timestamp?: string }
 */
router.post('/', async (req, res, next) => {
  try {
    const { appliance: applianceId, deviceId, voltage, current, power, status, timestamp } = req.body;

    // Resolve appliance either by direct ID or by deviceId lookup
    let appliance;
    if (applianceId) {
      if (!mongoose.Types.ObjectId.isValid(applianceId)) {
        return res.status(400).json({ message: 'Invalid appliance ID' });
      }
      appliance = await Appliance.findById(applianceId);
    } else if (deviceId) {
      const device = await Device.findOne({ deviceId });
      if (!device) return res.status(404).json({ message: 'Device not found' });
      appliance = await Appliance.findOne({ device: device._id, isActive: true });
    }

    if (!appliance) {
      return res.status(404).json({ message: 'Appliance not found' });
    }

    // Validate sensor data
    if (
      typeof voltage !== 'number' ||
      typeof current !== 'number' ||
      typeof power !== 'number' ||
      (status !== 'ON' && status !== 'OFF')
    ) {
      return res.status(400).json({ message: 'Invalid sensor data' });
    }

    // Create new reading
    const rec = await ApplianceData.create({
      appliance: appliance._id,
      voltage,
      current,
      power,
      status,
      isDummy: false,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    // Update appliance status
    appliance.currentStatus = status;
    await appliance.save();

    res.status(201).json(rec);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/data?applianceId=...
 * Returns the most recent 100 readings for a given appliance.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { applianceId } = req.query;
    if (!applianceId || typeof applianceId !== 'string') {
      return res.status(400).json({ message: 'applianceId query parameter is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(applianceId)) {
      return res.status(400).json({ message: 'Invalid applianceId format' });
    }

    const data = await ApplianceData.find({ appliance: applianceId })
      .sort({ timestamp: -1 })
      .limit(100);

    console.log(`Fetched ${data.length} records for appliance ${applianceId}`);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
