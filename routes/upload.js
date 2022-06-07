var express = require('express');
var router = express.Router();
const { checkAuth } = require('../service/auth');
const { checkFile } = require('../service/fileHandler');
const UploadController = require('../controllers/upload');

router.post('/', checkAuth, checkFile, UploadController.uploadToImgur);

module.exports = router;