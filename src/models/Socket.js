'use strict'

const mongoose = require('mongoose');
const crypto = require('crypto');

const SocketSchema = new mongoose.Schema({
    uuid: {
        type: String,
        unique: true,
        required: false
    },
    user_uuid: {
        type: String,
        required: false
    },
    socket_id: {
        type: String,
        required: false
    },
    is_online: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    strict: false
});

SocketSchema.pre("save", function (next) {
    if (this.uuid) return next();
    this.uuid = 'SKT-' + crypto.pseudoRandomBytes(4).toString('hex').toUpperCase();
    next();
});

module.exports = mongoose.model('socket', SocketSchema);