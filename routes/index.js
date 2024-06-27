const express = require('express');
const getStats = require('../controllers/appController')
const { 
        postNew,
        getMe } = require('../controllers/userController')
const connect = require('../controllers/authController')
const { 
        postUploads,
        getShow,
        getIndex,
        publish,
        unpublish,
        getFile,
        deleteFile
} = require('../controllers/filesController');
const validateToken = require('../middleware/validateToken')

const router = express.Router();

router.get('/stats', getStats);
router.post('/users', postNew);
router.post('/connect', connect);
router.get('/users/me',validateToken, getMe );
router.post('/upload', validateToken, postUploads);
router.get('/files/:id', validateToken, getShow);
router.get('/files', validateToken, getIndex);
router.put('/files/:id/publish', validateToken, publish);
router.put('/files/:id/unpublish', validateToken, unpublish);
router.get('/files/:id/data', validateToken, getFile);
router.delete('/files/:id', validateToken, deleteFile);

module.exports = router;
