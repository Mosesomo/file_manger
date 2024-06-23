const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Files', default: null },
    localPath: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Files", fileSchema);
