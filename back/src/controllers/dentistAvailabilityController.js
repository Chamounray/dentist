const DentistAvailability = require('../models/DentistAvailability');
   
exports.createAvailability = async (req, res) => {
  try {
    const availability = await DentistAvailability.create(req.body);
    res.status(201).json(availability);
  } catch (error) {
    console.error('Error creating dentist availability:', error);
    res.status(500).json({ error: 'Failed to create dentist availability' });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    // Optionally, you could filter by date via a query parameter
    const availabilities = await DentistAvailability.find();
    res.status(200).json(availabilities);
  } catch (error) {
    console.error('Error fetching dentist availability:', error);
    res.status(500).json({ error: 'Failed to get dentist availability' });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const availability = await DentistAvailability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json(availability);
  } catch (error) {
    console.error('Error updating dentist availability:', error);
    res.status(500).json({ error: 'Failed to update dentist availability' });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    await DentistAvailability.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Dentist availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting dentist availability:', error);
    res.status(500).json({ error: 'Failed to delete dentist availability' });
  }
};