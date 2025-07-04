import mongoose from 'mongoose';

const applianceHistorySchema = new mongoose.Schema({
  appliance: { type: mongoose.Schema.Types.ObjectId, ref: 'Appliance', required: true },
  totalRunMs: { type: Number, required: true },
  totalEnergyWh: { type: Number, required: true },
  sessionRunMs: { type: Number, required: true },
  sessionEnergyWh: { type: Number, required: true },
  computedBill: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ApplianceHistory', applianceHistorySchema);
