var express = require('express');
var router = express.Router();

var alerts = require('../controllers/alerts');
var Auth = require('../middleware/auth');

router.get('/alerts', Auth.verifyToken, alerts.getList);
router.post('/alerts/add', Auth.verifyToken, alerts.add);
router.delete('/alerts/:id', Auth.verifyToken, alerts.delete);

module.exports = router;
