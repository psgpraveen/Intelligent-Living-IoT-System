import express from 'express';
const router = express.Router();

let relayState = {
  relay3: false,
  relay4: false
};

// Get current state (ESP32 polls this)
router.get('/status', (req, res) => {
  res.json(relayState);
});

// Update state (Frontend POSTs to this)
router.post('/update', (req, res) => {
  const { relay3, relay4 } = req.body;
  if (typeof relay3 === 'boolean') relayState.relay3 = relay3;
  if (typeof relay4 === 'boolean') relayState.relay4 = relay4;

  console.log('Updated Relay State:', relayState);
  res.json({ success: true, relayState });
});

export default router;
