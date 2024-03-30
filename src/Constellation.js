//create a model for the constellation
const mongoose = require('mongoose');
const _ = require('underscore');

const ConstellationSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    planet: {
        type: String,
        required: true,
    },
    stars: {
        type: Array,
        required: true,
    },
    properties: {
        type: Array,
        required: true,
    },
});

ConstellationSchema.statics.toAPI = (doc) => ({
    id: doc.id,
    name: doc.name,
    planet: doc.planet,
    stars: doc.stars,
    properties: doc.properties,
});

const ConstellationModel = mongoose.model('Constellation', ConstellationSchema);
module.exports.ConstellationModel = ConstellationModel;