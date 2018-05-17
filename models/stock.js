const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
    symbol: {type: String, unique: true},
    color: String
})

const Stock = mongoose.model('stock', stockSchema);

module.exports = Stock;