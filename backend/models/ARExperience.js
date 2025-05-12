
import mongoose from 'mongoose';

const arExperienceSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  baseImage: { type: String, required: true },
  overlayImage: { type: String, required: true },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  scale: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

const ARExperience = mongoose.model('ARExperience', arExperienceSchema);

export default ARExperience;
