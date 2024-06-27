const asyncHandler = require('express-async-handler');
const Files = require('../models/file');
const Users = require('../models/users');
const fs = require('fs');
const mime = require('mime-types')
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

const publish = asyncHandler(async (req, res) => {
    const file = await Files.findById(req.params.id);
    if (!file) {
        res.status(404).json({Error: "File not Found"});
        throw new Error("File not Found");
    }

    if (file.userId.toString() !== req.user.id) {
        res.status(401).json({Error: "User unauthorized"});
        throw new Error("Unauthorized");
    }

    file.isPublic = true;
    await file.save();
    res.status(200).json(file)
});

const unpublish = asyncHandler(async (req, res) => {
    const file = await Files.findById(req.params.id);
    if (!file) {
        res.status(404).json({Error: "File not Found"});
        throw new Error("File not Found");
    }

    if (file.userId.toString() !== req.user.id) {
        res.status(401).json({Error: "User unauthorized"});
        throw new Error("Unauthorized");
    }

    file.isPublic = false;
    await file.save();
    res.status(200).json(file)
});

const getFile = asyncHandler(async (req, res) => {
    const file = await Files.findById(req.params.id);

    if (!file) {
        console.log('File not found in the database');
        res.status(404).json({Error: "Not Found"});
        throw new Error("Not Found");
    }

    if (file.isPublic === false && (!req.user || file.userId.toString() !== req.user.id)) {
        console.log('User not authorized to access this file');
        res.status(404).json({Error: "Not Found"});
        throw new Error("Not found");
    }

    if (file.type === "folder") {
        console.log('Requested file is a folder');
        res.status(400).json("A folder does not have the content!");
        throw new Error("A folder does not have the content!");
    }

    if (!fs.existsSync(file.localPath)) {
        console.log('Local file path does not exist');
        res.status(404).json({Error: "Not Found"});
        throw new Error("Not found");
    }

    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);
    fs.createReadStream(file.localPath).pipe(res);
});

const deleteFile = asyncHandler(async (req, res) => {
    const file = await Files.findById(req.params.id);

    if (!file) {
        console.log("File not found in the database");
        res.status(404).json({Error: "File Not Found"});
        throw new Error("File not Found")
    }

    if (file.userId.toString() !== req.user.id) {
        console.log("user unauthorized");
        res.status(401).json({Error: "user unauthorized"});
        throw new Error("Unauthorized");
    }

    await Files.deleteOne({_id: req.params.id});
    console.log("File deleted successfully");
    res.status(200).json({message: "File deleted successfully"});
})

module.exports = {
    postUploads,
    getShow,
    getIndex,
    publish,
    unpublish,
    getFile,
    deleteFile
};
