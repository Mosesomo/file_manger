const express = require('express');
const getStats = require('../controllers/appController')
const { 
        postNew,
        getMe } = require('../controllers/userController')
const connect = require('../controllers/authController')
const postUploads = require('../controllers/filesController');
const validateToken = require('../middleware/validateToken')

const router = express.Router();

router.get('/stats', getStats);
router.post('/users', postNew);
router.post('/connect', connect);
router.get('/users/me',validateToken, getMe );
router.post('/upload', validateToken, postUploads);

module.exports = router;
