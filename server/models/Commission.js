const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyTarget: { type: Number, default: 200 },
  commissionPercent: { type: Number, default: 10, min: 0, max: 100 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);