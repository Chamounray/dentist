const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const logger = require('../config/logger');
const DentistAvailability = require('../models/DentistAvailability');

// @desc    Get all appointments for a patient
// @route   GET /api/appointments/patient/:patientId
// @access  Private
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};



// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


// Helper function to add minutes to a time string ("HH:mm")
function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, mins);
  date.setMinutes(date.getMinutes() + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}// Helper function to add minutes to a time string ("HH:mm")
function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, mins);
  date.setMinutes(date.getMinutes() + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // expected format: "YYYY-MM-DD"
    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    // Use an aggregation expression to compare only the date portion.
    const availability = await DentistAvailability.findOne({
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          date
        ]
      }
    });

    if (!availability) {
      // No dentist availability defined for this date.
      return res.status(200).json({ success: true, data: [] });
    }

    // Use the dentist's defined start and end times.
    // (Ensure these are stored as strings like "10:00" and "16:00".)
    const workingHours = {
      start: availability.startTime, // e.g., "10:00"
      end: availability.endTime,     // e.g., "16:00"
      slotDuration: 30 // minutes per slot
    };

    const slots = [];
    let currentTime = workingHours.start;
    while (currentTime < workingHours.end) {
      const slotStart = currentTime;
      const slotEnd = addMinutes(currentTime, workingHours.slotDuration);
      if (slotEnd > workingHours.end) break;

      // Check for conflicts: if any appointment (that isn't cancelled) overlaps this slot.
      const conflict = await Appointment.findOne({
        date: new Date(date), // Using the selected date; ensure consistency with how you store appointment dates
        status: { $ne: 'cancelled' },
        $or: [
          {
            startTime: { $lt: slotEnd },
            endTime: { $gt: slotStart }
          }
        ]
      });

      if (!conflict) {
        slots.push({ startTime: slotStart, endTime: slotEnd });
      }
      currentTime = slotEnd;
    }

    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};
// (Other appointment endpoints such as createAppointment remain similar, but without a dentist field.)
exports.createAppointment = asyncHandler(async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    
    // Check for conflict with any existing appointment on that date.
    const conflict = await Appointment.findOne({
      date: new Date(date),
      status: { $ne: 'cancelled' },
      $or: [{
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }]
    });
    
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'Time slot is already booked'
      });
    }
    
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Helper function to add minutes to time string
function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, mins);
  date.setMinutes(date.getMinutes() + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}


exports.getRecentAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patient', 'user')
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName'
      }
    })
    .sort({ date: -1, startTime: -1 })
    .limit(5);

  const formattedAppointments = appointments.map(appointment => ({
    _id: appointment._id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    type: appointment.type,
    status: appointment.status,
    patientName: appointment.patient?.user 
      ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      : 'Unknown Patient',
    notes: appointment.notes
  }));

  res.status(200).json({
    success: true,
    data: formattedAppointments
  });
});


exports.getUpcomingAppointments = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await Appointment.find({
    date: { $gte: today },
    status: 'scheduled'
  })
  .populate('patient', 'user')
  .populate({
    path: 'patient',
    populate: {
      path: 'user',
      select: 'firstName lastName'
    }
  })
  .sort({ date: 1, startTime: 1 })
  .limit(10);

  // Format the appointments data
  const formattedAppointments = appointments.map(appointment => ({
    _id: appointment._id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    type: appointment.type,
    status: appointment.status,
    patientName: appointment.patient?.user 
      ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      : 'Unknown Patient',
    notes: appointment.notes
  }));

  res.status(200).json({
    success: true,
    data: formattedAppointments
  });
});



exports.getDentistAppointments = asyncHandler(async (req, res) => {
  const { limit, sort, status } = req.query;
  const query = {};
  if (status) {
    query.status = status;
  }
  // Default sort: descending by date and startTime
  const sortOption = sort ? sort : { date: -1, startTime: -1 };
  const appointments = await Appointment.find(query).sort(sortOption).limit(Number(limit) || 0);
  res.status(200).json({ success: true, data: appointments });
});

