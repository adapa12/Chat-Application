'use strict'

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    uuid : {
        type : String,
        unique : true,
        required : false
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    mobile : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        required : false,
        enum : ['user'],
        default : 'user'
    },
    profile_pic : {
        type : String,
        required : false,
        default : ""
    },
    is_active : {
        type : Boolean,
        default : true
    },
    is_deleted : {
        type : Boolean,
        default : false
    }
},{
    timestamps : true,
    strict : false
});

UserSchema.pre("save", function(next){
    if(this.uuid) return next();
    const codes = {
        user : "US",
    }
    this.uuid = codes[this.role]+'-'+crypto.pseudoRandomBytes(4).toString('hex').toUpperCase();
    next();
});


UserSchema.methods.generateToken = function() {
    return jwt.sign({
        _id : this.id,
        uuid : this.uuid,
        role : this.role,
        email : this.email,
        mobile : this.mobile,
        name : this.firstname,
    }, process.env.JWT_SECRET);
};

module.exports = mongoose.model('user',UserSchema);

