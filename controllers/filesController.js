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
    if (!type || !['folder', 'file', 'image'].includes(type)){
        return res.status(400).json({Error: "Missing type"});
    }
    if (!data && type !== 'folder') return res.status(400).json({Error: "Missing data"});

    if (parentId) {
        const parentFile = await Files.findOne({parentId});
        if (!parentFile) return res.status(400).json({Error: "parent not found"});
        if (parentFile !== 'folder') return res.status(400).json({Error: "parent not a folder"});
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
        isPublic: isPublic || null,
        parentId: parentId || null,
        localPath: localPath || null
    });
    console.log(file)
    res.status(200).json(file)
});

module.exports = postUploads;