const mongoose = require('mongoose');
const dbSchema = new mongoose.Schema({
   orderId: {
      type: Number,
      required: true
   },
   orderDate: {
      type: Date
   },
   sellerId: {
      type: Number
   },
   promisedShipDate: {
      type: Date
   },
   promisedDeliveryDate: {
      type: Date
   },
   actualShipDate: {
      type: Date
   },
   actualDeliveryDate: {
      type: Date
   },
   cancelStatus: {
      type: Boolean,
   },
   cancellationOrigin: {
      type: String
   },
   returnStatus: {
      type: Boolean,
   }
}, { timestamps: true });

module.exports = mongoose.model('Orders', dbSchema);