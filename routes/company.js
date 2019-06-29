var express = require('express');
var router = express.Router();

var Company = require('../controllers/company');
var Auth = require('../middleware/auth');

router.get('/companies', Auth.verifyToken, Company.getList);
router.post('/company/add', Auth.verifyToken,Company.add);
router.delete('/company/delete', Auth.verifyToken, Company.delete);

module.exports = router;
