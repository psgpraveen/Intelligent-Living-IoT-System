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
    const { appliance: applianceId, voltage, current, power, timestamp } = req.body;

    const espSecret = req.headers['x-iot-secret'];
    if (process.env.ESP32_SECRET && espSecret !== process.env.ESP32_SECRET) {
      return res.status(403).json({ message: 'Unauthorized device: Invalid ESP32 secret' });
    }

    if (!mongoose.Types.ObjectId.isValid(applianceId)) {
      return res.status(400).json({ message: 'Invalid appliance ID' });
    }

    const objectId = new mongoose.Types.ObjectId(applianceId);
    const appliance = await Appliance.findById(objectId);
    if (!appliance) return res.status(404).json({ message: 'Appliance not found' });

    if (typeof voltage !== 'number' || typeof current !== 'number' || typeof power !== 'number') {
      return res.status(400).json({ message: 'Invalid sensor data' });
    }

    // === Compute ON/OFF Status ===
    const low = appliance.powerThresholdLow ?? 1;
    const high = appliance.powerThresholdHigh ?? 999999;
    const computedStatus = (power >= low && power <= high) ? 'ON' : 'OFF';

    const incomingTime = timestamp ? new Date(timestamp) : new Date();

    // === Skip Duplicate Reading ===
    const lastReading = await ApplianceData.findOne({ appliance: objectId }).sort({ timestamp: -1 });
    const isDuplicate =
      lastReading &&
      lastReading.power === power &&
      lastReading.status === computedStatus &&
      new Date(lastReading.timestamp).getTime() === incomingTime.getTime();

    if (isDuplicate) {
      console.log(`⏸️ Skipping duplicate for ${appliance.name}`);
      return res.status(200).json({ message: 'Duplicate skipped' });
    }

    // === Save in ApplianceData ===
    const reading = await ApplianceData.create({
      appliance: objectId,
      voltage,
      current,
      power,
      status: computedStatus,
      timestamp: incomingTime
    });

    // === Track Runtime and Energy ===
    const ratePerKWh = 8; // update this if needed
    if (appliance.currentStatus === 'ON' && computedStatus === 'OFF' && appliance.lastOnAt) {
      const elapsedMs = incomingTime - appliance.lastOnAt;
      const elapsedHours = elapsedMs / 3600000;
      const avgWatt = appliance.powerRating || power || 0;
      const deltaEnergyWh = elapsedHours * avgWatt;
      const deltaBill = +(deltaEnergyWh / 1000 * ratePerKWh).toFixed(2);

      appliance.totalRunMs += elapsedMs;
      appliance.totalEnergyWh += deltaEnergyWh;
      appliance.lastOnAt = null;

      console.log(`📉 ${appliance.name} turned OFF, session: ${elapsedMs}ms, ${deltaEnergyWh.toFixed(2)}Wh, ₹${deltaBill}`);
    } else if (appliance.currentStatus === 'OFF' && computedStatus === 'ON') {
      appliance.lastOnAt = incomingTime;
      console.log(`⚡ ${appliance.name} turned ON at ${incomingTime.toISOString()}`);
    }

    // === Update Appliance status ===
    appliance.currentStatus = computedStatus;
    await appliance.save();

    console.log(`📥 [${new Date().toISOString()}] Data saved for ${appliance.name} with status ${computedStatus}`);
    return res.status(201).json({ message: 'Data saved', reading });

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
