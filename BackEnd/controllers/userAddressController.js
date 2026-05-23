const db = require('../models');
const UserAddress = db.UserAddress;

// GET all addresses for a user
const getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await UserAddress.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
};

// POST create a new address
const createAddress = async (req, res) => {
  try {
    const { userId, label, firstName, lastName, address, city, district, province, phone } = req.body;

    if (!userId || !firstName || !lastName || !address || !city || !district || !province || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user has any addresses — if not, make this the default
    const existingCount = await UserAddress.count({ where: { userId } });
    const isDefault = existingCount === 0;

    const newAddress = await UserAddress.create({
      userId,
      label: label || 'Home',
      firstName,
      lastName,
      address,
      city,
      district,
      province,
      phone,
      isDefault
    });

    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ success: false, message: 'Failed to create address' });
  }
};

// PUT update an existing address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, firstName, lastName, address, city, district, province, phone } = req.body;

    const existing = await UserAddress.findByPk(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await existing.update({ label, firstName, lastName, address, city, district, province, phone });
    res.json({ success: true, data: existing });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

// PUT set an address as default
const setDefault = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Unset all other defaults for this user
    await UserAddress.update({ isDefault: false }, { where: { userId } });

    // Set the new default
    await UserAddress.update({ isDefault: true }, { where: { id } });

    res.json({ success: true, message: 'Default address updated' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
};

// DELETE an address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await UserAddress.findByPk(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const wasDefault = existing.isDefault;
    const userId = existing.userId;
    await existing.destroy();

    // If deleted address was default, set next available address as default
    if (wasDefault) {
      const next = await UserAddress.findOne({ where: { userId }, order: [['createdAt', 'ASC']] });
      if (next) {
        await next.update({ isDefault: true });
      }
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, setDefault, deleteAddress };
