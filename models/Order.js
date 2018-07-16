const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const shortid  = require('shortid');

// Create Schema
const OrderSchema = new Schema({
  urlId: {
    type: String,
    default: shortid.generate
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customer'   
      },
    items:[{
        item: {
          type: Schema.Types.ObjectId,
          ref: 'item'   
            },  
        qty: {
          type: Number,
          min: 0,
          max: 99,
          required: true
        },
        tPrice: {
          type: Number,
          min: 1,
          max: 999999999999999,
          required: true
        }
    }],
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

module.exports = Order = mongoose.model('order', OrderSchema);
