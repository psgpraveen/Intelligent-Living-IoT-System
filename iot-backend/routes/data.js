import express from 'express';
import mongoose from 'mongoose';
import ApplianceData from '../models/ApplianceData.js';
import Appliance from '../models/Appliance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/data
 * ESP32 sends sensor readings (authenticated via x-iot-secret).
 * Body: { appliance, voltage, current, power, status, timestamp? }
 */

// GET /api/relay-state?applianceId=...&secret=...
router.get('/relay-state', async (req, res) => {
  const { applianceId, secret } = req.query;

  if (secret !== process.env.ESP32_SECRET) {
    return res.status(403).json({ message: 'Invalid ESP32 secret' });
  }

  if (!mongoose.Types.ObjectId.isValid(applianceId)) {
    return res.status(400).json({ message: 'Invalid appliance ID' });
  }

  const appliance = await Appliance.findById(applianceId);
  if (!appliance) return res.status(404).json({ message: 'Appliance not found' });

  return res.json({ status: appliance.currentStatus }); // "ON" or "OFF"
});



router.post('/', async (req, res, next) => {
  try {
    const { appliance: applianceId, voltage, current, power, status, timestamp } = req.body;

    // ✅ Secret-based auth for ESP32
    const espSecret = req.headers['x-iot-secret'];
    if (process.env.ESP32_SECRET && espSecret !== process.env.ESP32_SECRET) {
      return res.status(403).json({ message: 'Unauthorized device: Invalid ESP32 secret' });
    }

    // ✅ Validate appliance ID
    if (!mongoose.Types.ObjectId.isValid(applianceId)) {
      return res.status(400).json({ message: 'Invalid appliance ID' });
    }

    const objectId = new mongoose.Types.ObjectId(applianceId);

    // ✅ Find appliance
    const appliance = await Appliance.findById(objectId);
    console.log(`🔍 Appliance found: ${appliance?.name || 'None'}`);
    if (!appliance) {
      return res.status(404).json({ message: 'Appliance not found' });
    }

    // ✅ Validate sensor fields
    if (
      typeof voltage !== 'number' ||
      typeof current !== 'number' ||
      typeof power !== 'number' 
    ) {
      return res.status(400).json({ message: 'Invalid sensor data' });
    }

    const incomingTime = timestamp ? new Date(timestamp) : new Date();

    // ✅ Get last reading
    const lastReading = await ApplianceData.findOne({ appliance: objectId }).sort({ timestamp: -1 });

    const isDuplicate =
      lastReading &&
      lastReading.status === status &&
      lastReading.power === power &&
      new Date(lastReading.timestamp).getTime() === incomingTime.getTime();

    if (isDuplicate) {
      console.log(`⏸️ Duplicate reading skipped for ${appliance.name}`);
      return res.status(200).json({ message: 'Duplicate reading skipped' });
    }

    // ✅ Save new reading
    const reading = await ApplianceData.create({
      appliance: objectId,
      voltage,
      current,
      power,
      status,
      timestamp: incomingTime
    });

    // ✅ Update appliance status
    appliance.currentStatus = status;
    await appliance.save();

    console.log(`📥 [${new Date().toISOString()}] Data saved for ${appliance.name}`);
    res.status(201).json({ message: 'Data saved', reading });

  } catch (err) {
    console.error('❌ Error saving ESP32 data:', err.message);
    next(err);
  }
});

/**
 * GET /api/data?applianceId=...
 * Returns latest 100 readings (web dashboard use, protected).
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { applianceId } = req.query;

    if (!applianceId || !mongoose.Types.ObjectId.isValid(applianceId)) {
      return res.status(400).json({ message: 'Invalid or missing applianceId' });
    }

    const objectId = new mongoose.Types.ObjectId(applianceId);

    const data = await ApplianceData.find({ appliance: objectId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(data);
  } catch (err) {
    console.error('❌ Failed to fetch appliance data:', err.message);
    next(err);
  }
});

export default router;
