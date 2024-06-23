const express = require('express');
const getStats = require('../controllers/appController')
const { 
        postNew,
        getMe } = require('../controllers/userController')
const connect = require('../controllers/authController')
const { postUploads, getShow, getIndex } = require('../controllers/filesController');
const validateToken = require('../middleware/validateToken')

const router = express.Router();

router.get('/stats', getStats);
router.post('/users', postNew);
router.post('/connect', connect);
router.get('/users/me',validateToken, getMe );
router.post('/upload', validateToken, postUploads);
router.get('/files/:id', validateToken, getShow);
router.get('/files', validateToken, getIndex);

module.exports = router;
