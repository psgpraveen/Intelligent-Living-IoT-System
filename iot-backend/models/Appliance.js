import mongoose from 'mongoose';

const applianceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['Fan','Light','Heater','AC','Refrigerator','Other']
  },
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  isActive: { type: Boolean, default: true },
  currentStatus: { type: String, enum: ['ON','OFF'], default: 'OFF' },
  powerRating: { type: Number, default: 0 },
  lastOnAt: { type: Date, default: null },
  totalRunMs: { type: Number, default: 0 },
  totalEnergyWh: { type: Number, default: 0 },
  powerThresholdLow: { type: Number, default: 0 },
  powerThresholdHigh: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Appliance', applianceSchema);
