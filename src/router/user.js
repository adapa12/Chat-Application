'use strict'

const router = require('express').Router();
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require("../models/User");
const userAuth = require('../middleware/auth.user');


router.post('/register', async (req, res) => {
    try {
        const UserSchema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            mobile: Joi.string().required(),
            password: Joi.string().required(),
            role: Joi.string().valid("user").default('user').allow(""),
        });

        const validData = await UserSchema.validateAsync(req.body);

        let checkEmail = await User.findOne({ email: validData.email });
        if (checkEmail) return res.status(409).send({
            status: false,
            message: "Email Already Exists!"
        });
        let checkMobile = await User.findOne({ mobile: validData.mobile });
        if (checkMobile) return res.status(409).send({
            status: false,
            message: "Mobile Number Already Exists!"
        });
        validData.password = await bcrypt.hash(validData.password, 10);

        let user = await User.create(validData);

        return res.status(200).send({
            status: true,
            message: "Register Successfully",
            data: user,
        })
    } catch (error) {
        return res.status(400).send({
            status: false,
            message: error.message
        })
    }
});


router.post('/login', async (req, res) => {

    try {
        const LoginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });
        const validData = await LoginSchema.validateAsync(req.body);
        let email = validData.email;
        let user = await User.findOne({ $or: [{ email: email }, { user_name: validData.email }] });

        if (!user) {
            return res.status(404).send({
                status: false,
                message: "Email id is not Registered with us",
            });
        }
        if (user.is_deleted === true) {
            return res.status(400).send({
                status: false,
                message: "User Does Not Exists",
            });
        }
        if (user.is_active === false) {
            return res.status(400).send({
                status: false,
                message: "Your account is blocked. Please contact Admin",
            });
        }
        const password = validData.password;
        const cmp = await bcrypt.compare(validData.password, user.password);
        
        if (user && password) {
            if (cmp) {
                res.status(200).send({

                    status: true,
                    message: "Login Successfully!",
                    data: user,
                    token: user.generateToken()
                });
            } else {
                res.status(401).send({
                    status: false,
                    message: "Incorrect Password"
                });
            }
        } else {
            res.status(400).send("Email Id and Password Must be Entered");
        }
    } catch (error) {
        return res.status(400).send({
            status: false,
            message: error.message
        });
    }

});

module.exports = router
