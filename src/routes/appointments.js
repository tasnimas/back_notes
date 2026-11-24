import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import { parseAppointment } from '../utils/parseAppointment.js';

const router = Router();

router.post('/parse', (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string' || !text.trim() || text.length > 1000) {
    return res.status(400).json({ message: 'Please enter a message of up to 1000 characters.' });
  }
  return res.json(parseAppointment(text));
});

router.get('/', async (req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = {};
    if (typeof req.body.completed === 'boolean') allowed.completed = req.body.completed;
    if (!Object.keys(allowed).length) {
      return res.status(400).json({ message: 'No supported appointment changes were provided.' });
    }
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appointment);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid appointment ID.' });
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid appointment ID.' });
    next(error);
  }
});

export default router;
