import express from 'express';
import jwt from 'jsonwebtoken';
import ApplianceData from '../models/ApplianceData.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { applianceId, token } = req.query;

  // ✅ Step 1: Validate inputs
  if (!token) return res.status(401).json({ message: 'Token required in query' });
  if (!applianceId) return res.status(400).json({ message: 'applianceId is required' });

  try {
    // ✅ Step 2: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT verified:', decoded);

    const userId = decoded.userId;
    if (!userId) throw new Error('No userId in token');

    // ✅ Step 3: Check user existence
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      console.warn('❌ User not found or inactive');
      return res.status(403).json({ message: 'User not authorized' });
    }

    console.log(`✅ User [${user.email}] authenticated for streaming`);

    // ✅ Step 4: Setup SSE headers
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders();

    // ✅ Step 5: Function to stream the latest reading
    let lastSentData = null; // Cache the last sent data to avoid duplicates
    const send = async () => {
      try {
        const latest = await ApplianceData.find({ appliance: applianceId })
          .sort({ timestamp: -1 })
          .limit(1);

        if (latest[0]) {
          const dataToSend = {
            power: latest[0].power,
            voltage: latest[0].voltage,
            current: latest[0].current,
            status: latest[0].status,
            timestamp: latest[0].timestamp
          };

          // Avoid sending duplicate data
          if (JSON.stringify(dataToSend) !== JSON.stringify(lastSentData)) {
            res.write(`data: ${JSON.stringify(dataToSend)}\n\n`);
            console.log('📤 Sent data:', dataToSend);
            lastSentData = dataToSend;
          }
        }
      } catch (err) {
        console.error('❌ Error fetching appliance data:', err.message);
      }
    };

    send(); // Send immediately
    // const interval = setInterval(send, 2000); // Send every 2 seconds

    // // ✅ Step 6: Handle connection closure
    // req.on('close', () => {
    //   clearInterval(interval);
    //   res.end();
    //   console.log(`❌ SSE connection closed for applianceId ${applianceId}`);
    // });

  } catch (err) {
    console.error('❌ JWT verification failed or SSE setup error:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

export default router;
