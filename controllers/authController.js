const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const connect = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(401).json({error: "All fields are mandatory"});
        throw new Error("All fields are mandatory");
    }

    const user = await User.findOne({email});
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
            {
                user: {
                    email: user.email,
                    id: user.id
                },
            },
            process.env.ACCESS_TOKEN,
            { expiresIn: "20m" }
        );
        res.status(200).json({token: token});
    } else {
        res.status(400).json({error: "check email or password"});
        throw new Error("Please check your email or password");
    }
});

module.exports = connect;