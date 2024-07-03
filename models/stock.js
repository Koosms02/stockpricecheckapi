const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    stock: {
        type: String
    },
    likes: {
        type: Array
    }

})

module.exports = mongoose.model('stock', stockSchema);