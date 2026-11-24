import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: {
    type: String,
    required: true,
    enum: ['Doctors', 'Government', 'University', 'Car care', 'Salon', 'Interviews', 'Personal'],
  },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  location: { type: String, trim: true, maxlength: 160, default: '' },
  items: { type: [String], default: [] },
  reminders: { type: [String], default: [] },
  originalText: { type: String, trim: true, maxlength: 1000, default: '' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

appointmentSchema.index({ date: 1, time: 1 });

export default mongoose.model('Appointment', appointmentSchema);
