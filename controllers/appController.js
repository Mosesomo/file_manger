const asyncHandler = require('express-async-handler');
const User = require('../models/users');
const File = require('../models/file');

const getStats = asyncHandler(async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const fileCount = await File.countDocuments();

        res.status(200).json({ users: usersCount, files: fileCount });
    } catch (err) {
        res.status(500);
        throw new Error("Internal server Error");
    }
});

module.exports = getStats;