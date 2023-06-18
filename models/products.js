const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    img: {
        type: String,
    },
    rooms: {
        type: String,
    },
    address: {
        type: String,
    },
    area: {
        type: String,
    },
    tell: {
        type: String,
    },
});

const Products = mongoose.model("Products", productSchema);

module.exports = Products;
