const asyncHandler = require('express-async-handler');
const Files = require('../models/file');
const Users = require('../models/users');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const postUploads = asyncHandler(async (req, res) => {
    const { name, type, parentId, isPublic, data } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({Error: "Missing file name"});
    if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({Error: "Invalid type"});
    }
    if (!data && type !== 'folder') return res.status(400).json({Error: "Missing data"});

    let parentFile = null;
    if (parentId) {
        parentFile = await Files.findById(parentId);
        if (!parentFile) return res.status(400).json({Error: "Parent not found"});
        if (parentFile.type !== 'folder') return res.status(400).json({Error: "Parent not a folder"});
    }

    let localPath = '';
    if (type === 'file' || type === 'image') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/file_manager';
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
        const filename = uuidv4();
        localPath = path.join(folderPath, filename);
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
    }

    const file = await Files.create({
        userId,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || null,
        localPath: localPath || null
    });
    console.log(file);
    res.status(200).json(file);
});

const getShow = asyncHandler(async (req, res) => {
    const file = await Files.findById(req.params.id);

    if (!file) {
        res.status(404).json({Error: "Not Found"});
        throw new Error("Not Found");
    }

    if (file.userId.toString() !== req.user.id) {
        res.status(401).json({Error: "Unauthorized"});
        throw new Error("Unauthorized");
    }

    return res.status(200).json(file);
});

const getIndex = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const parentId = req.query.parentId === '0' ? null : req.query.parentId;
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;
    const skip = page * limit;

    const files = await Files.find({ userId, parentId }).skip(skip).limit(limit);
    res.status(200).json(files);
});

module.exports = {
    postUploads,
    getShow,
    getIndex
};
