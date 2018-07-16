const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid  = require('shortid');

// Create Schema
const ItemSchema = new Schema({ 
  urlId: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    max: 300,
    required: true
  },
  stock: {
    type: Number,
    min: 0,
    max: 99,
    required: true
  },
  price: {
    type: Number,
    min: 1,
    max: 999999999999999,
    required: true
  },
  currency: {
    type: String,
    max:3,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Item = mongoose.model('item', ItemSchema);
