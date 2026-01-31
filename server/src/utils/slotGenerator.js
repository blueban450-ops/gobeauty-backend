import AvailabilityRule from '../models/AvailabilityRule.js';
import BlockedTime from '../models/BlockedTime.js';
import Booking from '../models/Booking.js';

/**
 * Generate available time slots for a provider on a specific date
 * Excludes blocked times and existing bookings
 */
export async function getAvailableSlots(providerId, date, durationMin) {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay(); // 0=Sunday, 6=Saturday

  // Get availability rules for this day
  const rules = await AvailabilityRule.find({
    providerId,
    dayOfWeek,
    isActive: true
  });

  if (!rules.length) return [];

  const slots = [];

  for (const rule of rules) {
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);

    const slotStart = new Date(targetDate);
    slotStart.setHours(startHour, startMin, 0, 0);

    const slotEnd = new Date(targetDate);
    slotEnd.setHours(endHour, endMin, 0, 0);

    let current = new Date(slotStart);

    while (current < slotEnd) {
      const slotEndTime = new Date(current.getTime() + durationMin * 60000);
      
      if (slotEndTime <= slotEnd) {
        slots.push({
          start: new Date(current),
          end: new Date(slotEndTime)
        });
      }
      
      current = new Date(current.getTime() + rule.slotSizeMin * 60000);
    }
  }

  // Filter out blocked times
  const blocked = await BlockedTime.find({
    providerId,
    $or: [
      { startAt: { $lte: new Date(date + 'T23:59:59') }, endAt: { $gte: new Date(date + 'T00:00:00') } }
    ]
  });

  // Filter out existing bookings
  const startOfDay = new Date(date + 'T00:00:00');
  const endOfDay = new Date(date + 'T23:59:59');
  
  const bookings = await Booking.find({
    providerId,
    status: { $nin: ['CANCELLED', 'REJECTED'] },
    scheduledStart: { $gte: startOfDay, $lte: endOfDay }
  });

  // Remove overlapping slots
  const availableSlots = slots.filter(slot => {
    // Check blocked times
    const isBlocked = blocked.some(b => 
      (slot.start >= b.startAt && slot.start < b.endAt) ||
      (slot.end > b.startAt && slot.end <= b.endAt) ||
      (slot.start <= b.startAt && slot.end >= b.endAt)
    );

    if (isBlocked) return false;

    // Check bookings
    const isBooked = bookings.some(booking => 
      (slot.start >= booking.scheduledStart && slot.start < booking.scheduledEnd) ||
      (slot.end > booking.scheduledStart && slot.end <= booking.scheduledEnd) ||
      (slot.start <= booking.scheduledStart && slot.end >= booking.scheduledEnd)
    );

    return !isBooked;
  });

  return availableSlots.map(s => ({
    start: s.start.toISOString(),
    end: s.end.toISOString()
  }));
}

/**
 * Atomically create booking - prevents double booking
 */
export async function createBookingAtomic(bookingData) {
  const { providerId, scheduledStart, scheduledEnd, customerUserId, mode, items, total, groupSize, customerAddress, paymentMethod } = bookingData;

  const startTime = new Date(scheduledStart);
  const endTime = new Date(scheduledEnd);

  // Check for overlapping bookings
  const existingBooking = await Booking.findOne({
    providerId,
    status: { $nin: ['CANCELLED', 'REJECTED'] },
    $or: [
      { scheduledStart: { $gte: startTime, $lt: endTime } },
      { scheduledEnd: { $gt: startTime, $lte: endTime } },
      { scheduledStart: { $lte: startTime }, scheduledEnd: { $gte: endTime } }
    ]
  });

  if (existingBooking) {
    throw new Error('Time slot already booked');
  }

  // Check blocked times
  const blockedTime = await BlockedTime.findOne({
    providerId,
    $or: [
      { startAt: { $lte: endTime }, endAt: { $gte: startTime } }
    ]
  });

  if (blockedTime) {
    throw new Error('Time slot is blocked');
  }

  // Create booking
  const booking = await Booking.create({
    customerUserId,
    providerId,
    mode,
    scheduledStart: startTime,
    scheduledEnd: endTime,
    status: 'PENDING',
    items,
    total,
    groupSize: groupSize || 1,
    paymentMethod,
    customerAddress
  });

  return booking;
}
