const Item = require('./itemModel');

// @desc    Get all items (all users can see all items)
// @route   GET /api/items
// @access  Protected
const getItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Protected
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name email');
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Search items by name or category
// @route   GET /api/items/search?name=xyz&category=abc
// @access  Protected
const searchItems = async (req, res, next) => {
  try {
    const { name, category } = req.query;
    const query = {};

    if (name) {
      query.itemName = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const items = await Item.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Protected
const createItem = async (req, res, next) => {
  try {
    const { itemName, description, type, category, location, date, contactInfo } = req.body;

    if (!itemName || !type || !location || !date || !contactInfo) {
      res.status(400);
      throw new Error('Please provide itemName, type, location, date, and contactInfo');
    }

    if (!['Lost', 'Found'].includes(type)) {
      res.status(400);
      throw new Error('Type must be "Lost" or "Found"');
    }

    const item = await Item.create({
      itemName,
      description: description || '',
      type,
      category: category || 'Other',
      location,
      date,
      contactInfo,
      userId: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an item (ownership check)
// @route   PUT /api/items/:id
// @access  Protected
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this item');
    }

    const { itemName, description, type, category, location, date, contactInfo } = req.body;
    if (itemName !== undefined) item.itemName = itemName;
    if (description !== undefined) item.description = description;
    if (type !== undefined) item.type = type;
    if (category !== undefined) item.category = category;
    if (location !== undefined) item.location = location;
    if (date !== undefined) item.date = date;
    if (contactInfo !== undefined) item.contactInfo = contactInfo;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item (ownership check)
// @route   DELETE /api/items/:id
// @access  Protected
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this item');
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItems, getItemById, searchItems, createItem, updateItem, deleteItem };
