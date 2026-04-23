const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  searchItems,
  createItem,
  updateItem,
  deleteItem,
} = require('./itemController');

// IMPORTANT: /search must be defined BEFORE /:id
// GET /api/items/search?name=xyz&category=abc
router.get('/search', searchItems);

// GET  /api/items     — get all items
// POST /api/items     — create an item
router.route('/').get(getItems).post(createItem);

// GET    /api/items/:id — get single item
// PUT    /api/items/:id — update item
// DELETE /api/items/:id — delete item
router.route('/:id').get(getItemById).put(updateItem).delete(deleteItem);

module.exports = router;
