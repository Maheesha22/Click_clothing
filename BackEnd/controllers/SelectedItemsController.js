const { SelectedItems } = require('../models');

exports.saveSelectedItems = async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data. userId and items array are required."
    });
  }

  try {
    // 1. Clear existing selected items for this user
    await SelectedItems.destroy({
      where: { userId }
    });

   
    console.log('SelectedItemsController - Received items:', JSON.stringify(items, null, 2));
    
    const itemsToSave = items.map(item => {
      const pId = item.productId || item.id;
      console.log(`Processing item: Name=${item.name}, ProductID=${pId}`);
      
      return {
        userId: userId,
        productId: pId,
        size: item.sizeLabel || item.size,
        color: item.colorName || item.color,
        price: item.price,
        quantity: item.qty || item.quantity,
        imageUrl: item.imageUrl
      };
    });

    
    const savedItems = await SelectedItems.bulkCreate(itemsToSave);

    res.status(201).json({
      success: true,
      message: "Selected items saved successfully",
      count: savedItems.length
    });
  } catch (error) {
    console.error("Error saving selected items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save selected items",
      error: error.message
    });
  }
};

exports.getSelectedItems = async (req, res) => {
  const { userId } = req.params;

  try {
    const items = await SelectedItems.findAll({
      where: { userId }
    });

    res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    console.error("Error fetching selected items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch selected items",
      error: error.message
    });
  }
};
