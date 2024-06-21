const asyncHandler = require('express-async-handler');
const User = require('../models/users');
const bcrypt = require('bcrypt');

const postNew = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Missing email!' });
            throw new Error('Eamil required..');
        }
        if (!password) {
            res.status(400).json({ error: "Missing password!" });
            throw new Error('password required...');
        }

        const userAvailable = await User.findOne({email});
        if (userAvailable) {
            res.status(400).json({error: "email already exists!"})
            throw new Error("User already registered!");
        }

        hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Hashed password: ${hashedPassword}`);

        const user = await User.create({
            email,
            password: hashedPassword
        });
        if (user) {
            console.log(user)
            res.status(200).json({ id: user.id, email: user.email });
        } else {
            res.status(401);
            throw new Error("Invalid user credential")
        }
    } catch(err) {
        console.log(err);
    }
});

const getMe = asyncHandler(async (req, res) =>{
    res.status(200).json(req.user);
})

module.exports = { 
    postNew,
    getMe
};