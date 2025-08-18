const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');


router.post('/', enquiryController.createEnquiry);
router.get('/', enquiryController.getAllEnquiries);
router.patch('/:id/status', enquiryController.updateEnqiryStatus);
router.patch('/:id/comment', enquiryController.updateComment);

module.exports = router;