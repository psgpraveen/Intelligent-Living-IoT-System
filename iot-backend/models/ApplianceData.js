import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  appliance: { type: mongoose.Schema.Types.ObjectId, ref: 'Appliance', required: true },
  voltage: Number,
  current: Number,
  power: Number,
  status: { type: String, enum: ['ON', 'OFF'] },
  timestamp: { type: Date, default: Date.now }
});

dataSchema.index({ appliance: 1, timestamp: -1 });

export default mongoose.models.ApplianceData || mongoose.model('ApplianceData', dataSchema);
